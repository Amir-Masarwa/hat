# Task Manager Backend

NestJS backend API for the Task Manager application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Make sure the database is running (from the `db` folder):
```bash
docker-compose up -d
```

3. Generate Prisma client:
```bash
npm run prisma:generate
```

4. Run database migrations:
```bash
npm run prisma:migrate
```

5. Start the development server:
```bash
npm run start:dev
```

The API will be available at http://localhost:3001

## API Endpoints

### Users
- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID
- `POST /users` - Create a new user
- `PATCH /users/:id` - Update a user
- `DELETE /users/:id` - Delete a user

### Tasks
- `GET /tasks` - Get all tasks (optional query: `?userId=1`)
- `GET /tasks/:id` - Get task by ID
- `POST /tasks` - Create a new task
- `PATCH /tasks/:id` - Update a task
- `DELETE /tasks/:id` - Delete a task

## Database Schema

### User
- id (Int, auto-increment)
- email (String, unique)
- name (String, optional)
- createdAt (DateTime)
- updatedAt (DateTime)
- tasks (Task[])

### Task
- id (Int, auto-increment)
- title (String)
- description (String, optional)
- completed (Boolean, default: false)
- userId (Int, foreign key to User)
- createdAt (DateTime)
- updatedAt (DateTime)

