@echo off
echo Restarting Energy Ingestion Engine...
echo.
docker-compose down
echo.
docker-compose up
