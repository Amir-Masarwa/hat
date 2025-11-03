#!/bin/bash
# Start PostgreSQL database using Docker
cd "$(dirname "$0")"
docker-compose up -d
echo "Database started! Connect using:"
echo "  DATABASE_URL=postgresql://postgres:postgres@localhost:5432/task_manager"
echo ""
echo "To stop the database, run: docker-compose down"

