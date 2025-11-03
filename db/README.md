# Database Setup

## Starting the Database

Run this command from the `db` folder (or from the root with `db/docker-compose.yml`):

```bash
docker-compose up -d
```

This will start PostgreSQL on port 5432 with:
- Username: `postgres`
- Password: `postgres`
- Database: `task_manager`

## Stopping the Database

```bash
docker-compose down
```

## Viewing the Database

You can use Prisma Studio:
```bash
cd ../back
npm run prisma:studio
```

Or connect with any PostgreSQL client using:
- Host: `localhost`
- Port: `5432`
- User: `postgres`
- Password: `postgres`
- Database: `task_manager`

