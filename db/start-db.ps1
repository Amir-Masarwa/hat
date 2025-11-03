# Start PostgreSQL database using Docker
cd $PSScriptRoot
docker-compose up -d
Write-Host "Database started! Connect using:"
Write-Host "  DATABASE_URL=postgresql://postgres:postgres@localhost:5432/task_manager"
Write-Host ""
Write-Host "To stop the database, run: docker-compose down"

