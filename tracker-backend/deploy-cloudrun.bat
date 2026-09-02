@echo off
echo ===================================================
echo   Deploying Tracker Backend to Google Cloud Run
echo ===================================================

gcloud run deploy tracker-backend ^
  --source . ^
  --platform managed ^
  --region us-central1 ^
  --allow-unauthenticated ^
  --set-env-vars MONGO_URI="mongodb+srv://tracker-backend:1234@cluster0.20h5i3g.mongodb.net/tracker?retryWrites=true&w=majority"

echo ===================================================
echo   Deployment completed! Check service URL above.
echo ===================================================
