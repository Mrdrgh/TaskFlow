import mongoose from "mongoose";
import dotenv from "dotenv"

dotenv.config();
const connectDB = async (): Promise<void> => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI as string)

        console.log("Connected to the mongodb database");
    } catch (error) {
        console.error("Error during connection to mongoDb " + error);
        process.exit(1);
    }
};

export default connectDB;