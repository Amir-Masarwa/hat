import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
const cookieParser = require('cookie-parser');

describe('Tasks API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let userId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.enableCors({
      origin: 'http://localhost:3000',
      credentials: true,
    });
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    // Clean database
    await prisma.task.deleteMany();
    await prisma.user.deleteMany();
    await (prisma as any).ipAllowList.deleteMany();

    // Add localhost to IP allow-list
    await (prisma as any).ipAllowList.create({
      data: { ip: '::ffff:127.0.0.1', label: 'Test IP', isActive: true },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  describe('Authentication and Task Creation', () => {
    it('should create a user, verify, and login', async () => {
      // Signup
      const signupRes = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email: 'tasktest@example.com',
          name: 'Task Tester',
          password: 'password123',
        })
        .expect(201);

      expect(signupRes.body.message).toContain('Verification code sent');

      // Get user from DB and mark as verified for testing
      const user: any = await prisma.user.findUnique({
        where: { email: 'tasktest@example.com' },
      });

      expect(user).toBeDefined();
      userId = user!.id;

      // Mark user as verified for testing (skip verification code check)
      await prisma.user.update({
        where: { id: userId },
        data: { verified: true } as any,
      });

      // Login
      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'tasktest@example.com',
          password: 'password123',
        })
        .expect(201);

      expect(loginRes.body.message).toBe('Logged in successfully');
      
      // Extract token from cookie
      const cookies = loginRes.headers['set-cookie'];
      expect(cookies).toBeDefined();
      authToken = cookies[0].split(';')[0].split('=')[1];
    });
  });

  describe('Task CRUD Operations', () => {
    it('should create a task', async () => {
      const res = await request(app.getHttpServer())
        .post('/tasks')
        .set('Cookie', [`token=${authToken}`])
        .send({
          title: 'Test Task',
          description: 'Test Description',
        })
        .expect(201);

      expect(res.body.title).toBe('Test Task');
      expect(res.body.description).toBe('Test Description');
      expect(res.body.completed).toBe(false);
      expect(res.body.userId).toBe(userId);
    });

    it('should get all user tasks', async () => {
      const res = await request(app.getHttpServer())
        .get('/tasks')
        .set('Cookie', [`token=${authToken}`])
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].title).toBe('Test Task');
    });

    it('should update a task', async () => {
      const tasks = await prisma.task.findMany({ where: { userId } });
      const taskId = tasks[0].id;

      const res = await request(app.getHttpServer())
        .patch(`/tasks/${taskId}`)
        .set('Cookie', [`token=${authToken}`])
        .send({
          title: 'Updated Task',
          completed: true,
        })
        .expect(200);

      expect(res.body.title).toBe('Updated Task');
      expect(res.body.completed).toBe(true);
    });

    it('should delete a task', async () => {
      const tasks = await prisma.task.findMany({ where: { userId } });
      const taskId = tasks[0].id;

      await request(app.getHttpServer())
        .delete(`/tasks/${taskId}`)
        .set('Cookie', [`token=${authToken}`])
        .expect(200);

      const deletedTask = await prisma.task.findUnique({ where: { id: taskId } });
      expect(deletedTask).toBeNull();
    });

    it('should reject unauthenticated task access', async () => {
      await request(app.getHttpServer())
        .get('/tasks')
        .expect(401);

      await request(app.getHttpServer())
        .post('/tasks')
        .send({ title: 'Unauthorized Task' })
        .expect(401);
    });

    it('should validate task creation input', async () => {
      // Missing title
      await request(app.getHttpServer())
        .post('/tasks')
        .set('Cookie', [`token=${authToken}`])
        .send({ description: 'No title' })
        .expect(400);
    });
  });
});

