[![Build Status](https://dev.azure.com/paul2005/paul2005/_apis/build/status/PabloDiablo.Realtime-Pub-Quiz?branchName=master)](https://dev.azure.com/paul2005/paul2005/_build/latest?definitionId=2&branchName=master)

# Pub Quiz

Forked from [Aaron van den Berg's Realtime Pub Quiz project](https://github.com/aaron5670/Realtime-Pub-Quiz).

## Setup

Runs on Google Cloud using Firebse Realtime DB, Cloud Firestore, Firebase Hosting and Cloud Run.

Install Firebase CLI and Google Cloud CLI if not already installed

Create Firebase project and use project: `firebase use FIREBASE-PROJECT-ID`

Create file `.firebaserc` in the root and enter your Firebase project information:

```
{
  "projects": {
    "default": "firebase-project-id-here"
  }
}

```

Create file `client/.env` and enter your Firebase config in the format described in `client/.env.example`
Create file `server/.env` and enter your config in the format described in `server/env.example`

Install dependencies: `yarn`

Build and run: `yarn dev`

## Deployment

### Game Server

`GCLOUD_PROJECT_ID` = The Firebase project ID from the setup steps

- Build the Docker image `docker build . -t gcr.io/GCLOUD_PROJECT_ID/game-server`
- Upload the Docker image to Google Cloud `gcloud builds submit --tag gcr.io/GCLOUD_PROJECT_ID/game-server`
- Deploy the image to Cloud Run `gcloud beta run deploy --image gcr.io/GCLOUD_PROJECT_ID/game-server --set-env-vars QM_PASS=PASSWORD_FOR_QUIZ_MASTER,GCLOUD_PROJECT=GCLOUD_PROJECT_ID`

### Frontend

- Deploy the frontend to Firebase Hosting: `yarn deploy`
