/* eslint-disable @typescript-eslint/no-var-requires */

const res = require('./res2.json');

console.log('Processing res data');

const sortedAnswers = res.answers.filter(a => a.timestamp !== undefined).sort((a, b) => a.timestamp - b.timestamp);

const numberOfAnswers = sortedAnswers.length;

const timeDiff = sortedAnswers[numberOfAnswers - 1].timestamp - sortedAnswers[0].timestamp;
console.log(`Time diff of first to last: ${timeDiff}ms`);
