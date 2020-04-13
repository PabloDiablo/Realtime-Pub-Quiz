# Pub Quiz

Forked from [Aaron van den Berg's Realtime Pub Quiz project](https://github.com/aaron5670/Realtime-Pub-Quiz).

## Setup

Requires Node 13.

Create file `server/config.ts`:

```javascript
const USERNAME = 'username';
const PASSWORD = 'password';
const HOST = 'localhost';
const PORT = '27017';
const DB = 'quizzer';

export default { USERNAME, PASSWORD, HOST, PORT, DB };
```

Add your MongoDB server connection details.

Install dependencies: `yarn`.

Run app in dev mode: `yarn dev`.

On first run, the database will need to be seeded with question data: `yarn seed`. _Note: rerunning this script will reset the DB to initial state._

Go to http://localhost:8080/ in your browser.

## Roadmap

- ~~Translate game text to English~~

- ~~Remove hard coded 12 quesion limit in rounds~~

- ~~Add support for images in questions~~

- ~~Combine client and server into single app with dev and production build modes~~

- Add persistent sessions

- Add socket connection recovery

- ~~Migrate to TypeScript~~

- Use TypeScript properly

- Migrate from WebSocket to socket.io

- Migrate from MongoDB to an RDBMS (Maria or Postgres)

- Dockerise

- Automate deployment
