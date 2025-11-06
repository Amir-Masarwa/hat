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

to see the db  :
 
cd back
npx prisma studio

to test :
<you need to give it real User<email and password> 
to the file "front\cypress\e2e\complete-user-journey.cy.ts" >
npm run test:e2e
