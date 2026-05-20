import Redis from 'ioredis';
import dotenv from 'dotenv';
dotenv.config();

const test = async () => {
    console.log("Connecting to Redis...");
    const redis = new Redis(process.env.REDIS_URL, { connectTimeout: 3000 });
    
    redis.on('connect', () => {
        console.log("Connected to Redis!");
        process.exit(0);
    });

    redis.on('error', (err) => {
        console.error("Redis Error:", err);
        process.exit(1);
    });
}
test();
