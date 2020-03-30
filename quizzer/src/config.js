// Production
const URL = window.location.hostname;
const httpHostname = `http://${URL}/api`;

// Dev
// const URL = "localhost:3001";
// const httpHostname = `http://${URL}`;

module.exports = { URL, httpHostname };
