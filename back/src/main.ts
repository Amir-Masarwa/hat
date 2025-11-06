import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
const cookieParser = require('cookie-parser');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Trust proxy to get real client IP (important for Render deployment)
  app.getHttpAdapter().getInstance().set('trust proxy', true);
  
  // Enable cookie parsing
  app.use(cookieParser());
  
  // Enable CORS for React frontend with credentials
  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);
      
      // Allow localhost and all Vercel deployments
      const allowedPatterns = [
        /^http:\/\/localhost:\d+$/,
        /^https:\/\/.*\.vercel\.app$/,
      ];
      
      const isAllowed = allowedPatterns.some(pattern => pattern.test(origin));
      
      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  });
  
  // Enable validation
  app.useGlobalPipes(new ValidationPipe());
  
  await app.listen(3001, '0.0.0.0');
  console.log('Application is running on: http://0.0.0.0:3001 (accessible from all interfaces)');
}
bootstrap();

