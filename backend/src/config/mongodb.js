import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export const connectDB = async () => {
    const mongoURI = process.env.USE_LOCAL_MONGO === "false" ? process.env.MONGO_URI : 'mongodb://localhost:27017/gshs-acadbridge-local'; // Fallback to local DB if MONGO_URI is not set

    try {
        console.log(`Connecting to ${mongoURI}`);
        const conn = await mongoose.connect(mongoURI);
        console.log('MongoDB connected');
    } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
    }
}

export default connectDB;
