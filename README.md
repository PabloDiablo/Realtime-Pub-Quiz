# Pub Quiz

Forked from [Aaron van den Berg's Realtime Pub Quiz project](https://github.com/aaron5670/Realtime-Pub-Quiz).

## Setup

Create file `server/config.js`:

```javascript
const USERNAME = 'username';
const PASSWORD = 'password';
const HOST = 'localhost';
const PORT = '27017';
const DB = 'quizzer';

module.exports = { USERNAME, PASSWORD, HOST, PORT, DB };
```

Add your MongoDB server connection details.

Open `client/src/config.js`. Uncomment `Dev` section. Comment out `Production` section.

Run `npm install` in both `server` and `client` folders.

Run seed script to populate DB with questions: `npm run seed` in `server` folder.

Run server: `npm run start:watch` in `server` folder.

Run client: `npm start` in `client` folder.

## Roadmap

- ~~Translate game text to English~~

- ~~Remove hard coded 12 quesion limit in rounds~~

- ~~Add support for images in questions~~

- Combine client and server into single app with dev and production build modes

- Add persistent sessions

- Add socket connection recovery

- Migrate to TypeScript

- Migrate from WebSocket to socket.io

- Migrate from MongoDB to an RDBMS (Maria or Postgres)

- Dockerise

- Automate deployment
