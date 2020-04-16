const fs = require('fs');
const packageJson = require('../package.json');

const data = {
  ...packageJson,
  scripts: {
    start: 'node ./index.js',
    seed: 'node ./seed.js'
  },
  devDependencies: undefined,
  main: './index.js'
};

try {
  fs.writeFileSync('./dist/server/package.json', JSON.stringify(data, undefined, 2), { encoding: 'utf8' });
  console.log('Written package.json file.');
} catch (err) {
  console.log(`Unable to write package.json file. Error code: ${err.code}`);
  console.error(err);
  process.exit(1);
}
