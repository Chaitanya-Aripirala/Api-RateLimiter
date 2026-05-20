import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const test = async () => {
    console.log("Connecting to:", process.env.MONGO_URL);
    try {
        await mongoose.connect(process.env.MONGO_URL, { serverSelectionTimeoutMS: 5000 });
        console.log("SUCCESS!");
        process.exit(0);
    } catch (err) {
        console.error("ERROR:", err.message);
        process.exit(1);
    }
}
test();
