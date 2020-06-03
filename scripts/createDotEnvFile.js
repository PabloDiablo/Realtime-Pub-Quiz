const fs = require('fs');

const envVarsToSave = [
  'DATABASE',
  'GOOGLE_APPLICATION_CREDENTIALS',
  'FB_DATABASE_URL',
  'FB_API_KEY',
  'FB_AUTH_DOMAIN',
  'FB_PROJECT_ID',
  'FB_STORAGE_BUCKET',
  'FB_MESSAGING_SENDER_ID',
  'FB_APP_ID',
  'FB_MEASUREMENT_ID'
];

const buffer = [];

envVarsToSave.forEach(v => {
  if (process.env.hasOwnProperty(v)) {
    buffer.push(`${v}=${process.env[v]}`);
  }
});

const strOut = buffer.join('\n');

console.log(strOut);

try {
  fs.writeFileSync('./.env', strOut, { encoding: 'utf8' });
  console.log('Written dotenv file.');
} catch (err) {
  console.log(`Unable to write dotenv file. Error code: ${err.code}`);
  console.error(err);
  process.exit(1);
}
