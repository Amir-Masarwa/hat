# Task Manager Web Application

A full-stack task management application built with NestJS (backend) and React (frontend).

## Project Structure

```
.
├── back/          # NestJS backend API
├── db/            # PostgreSQL database setup (Docker)
└── front/         # React frontend
```

## Quick Start

### 1. Start the Database

From the `db` directory:
```bash
cd db
docker-compose up -d
```

### 2. Setup Backend

```bash
cd back
npm install
npm run prisma:generate
npm run prisma:migrate
npm run start:dev
```

Backend will run on http://localhost:3001

### 3. Setup Frontend

In a new terminal:
```bash
cd front
npm install
npm start
```

Frontend will run on http://localhost:3000

## Database Schema

### User Table
- `id` - Primary key (auto-increment)
- `email` - Unique email address
- `name` - Optional name
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

### Task Table
- `id` - Primary key (auto-increment)
- `title` - Task title
- `description` - Optional description
- `completed` - Boolean (default: false)
- `userId` - Foreign key to User
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

## Features

- ✅ Create and manage users
- ✅ Create tasks for users
- ✅ View all tasks or filter by user
- ✅ Mark tasks as complete/incomplete
- ✅ Delete tasks
- ✅ RESTful API with validation

## Next Steps

You can extend this basic setup with:
- User authentication
- Task categories/tags
- Due dates and reminders
- Task prioritization
- Search and filtering
- And more!

