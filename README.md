[![Build Status](https://dev.azure.com/paul2005/paul2005/_apis/build/status/PabloDiablo.Realtime-Pub-Quiz?branchName=master)](https://dev.azure.com/paul2005/paul2005/_build/latest?definitionId=2&branchName=master)

# Pub Quiz

Forked from [Aaron van den Berg's Realtime Pub Quiz project](https://github.com/aaron5670/Realtime-Pub-Quiz).

## Setup

Runs on Firebase using Realtime DB, Cloud Firestore, Hosting and Functions.

Create file `.firebaserc` in the root and enter your Firebase project information:

```
{
  "projects": {
    "default": "firebase-project-id-here"
  }
}

```

Create file `client/.env` and enter your Firebase config in the format described in `client/.env.example`

Install dependencies: `yarn`

Build: `yarn build`

Start Firebase emulators: `yarn start`
