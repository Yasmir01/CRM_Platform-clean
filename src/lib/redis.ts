let Redis: any;
let redisClient: any = null;

try {
  // require dynamically to avoid bundler issues when ioredis is not installed
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Redis = require('ioredis');
  const redisUrl = process.env.REDIS_URL || '';
  if (redisUrl) redisClient = new Redis(redisUrl);
} catch (e) {
  // ioredis not installed or failed to init; fall back to null
  // eslint-disable-next-line no-console
  console.warn('ioredis not available, redisClient disabled');
  redisClient = null;
}

export default redisClient;
export { redisClient };
