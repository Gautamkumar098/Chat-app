
import mongoose from "mongoose";


 export const connectDb = async () => {
    try {
        await mongoose.connect(process.env.DB_URL);
        console.log("mongodb connected successfully");
    } catch (error) {
        console.log("error is:", error);
        
    }
};



