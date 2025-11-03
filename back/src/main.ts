import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
const cookieParser = require('cookie-parser');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable cookie parsing
  app.use(cookieParser());
  
  // Enable CORS for React frontend with credentials
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });
  
  // Enable validation
  app.useGlobalPipes(new ValidationPipe());
  
  await app.listen(3001);
  console.log('Application is running on: http://localhost:3001');
}
bootstrap();

