@echo off
echo ===================================================
echo   Deploying Tracker Backend to Google Cloud Run
echo ===================================================

if "%MONGO_URI%"=="" (
  echo [ERROR] MONGO_URI environment variable is not set.
  echo Please set MONGO_URI before deploying, for example:
  echo   set MONGO_URI=your_mongodb_connection_string
  exit /b 1
)

gcloud run deploy tracker-backend ^
  --source . ^
  --platform managed ^
  --region us-central1 ^
  --allow-unauthenticated ^
  --set-env-vars MONGO_URI="%MONGO_URI%"

echo ===================================================
echo   Deployment completed! Check service URL above.
echo ===================================================
