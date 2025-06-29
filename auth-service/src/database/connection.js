import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
const DbConnection = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_URL).then(() => console.log("MongoDB connected successfully"));
    } catch (error) {
        console.error("MongoDB connection error:", error);
        throw error;
    }
};
export default DbConnection;