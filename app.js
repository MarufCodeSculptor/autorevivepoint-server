const crypto = require('crypto');

const randomHex = crypto.randomBytes(32).toString('hex').toUpperCase()+crypto.randomBytes(32).toString('hex');
console.log(randomHex);

