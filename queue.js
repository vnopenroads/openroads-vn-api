const Queue = require('bull');

const redisUrl = process.env.REDIS_URL || 'http://127.0.0.1:6379';

module.exports = new Queue('RLP-Queue', redisUrl);