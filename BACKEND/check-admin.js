import "dotenv/config";
import mongoose from "mongoose";
import Admin from "./models/admin.js";

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");
        
        const admins = await Admin.find({});
        console.log("Existing admins in database:", admins);
        
        if (admins.length === 0) {
            console.log("No admins found. Creating a default test admin...");
            const newAdmin = new Admin({
                name: "Zanosa Admin",
                email: "admin@zanosa.com",
                password: "adminpassword"
            });
            await newAdmin.save();
            console.log("Default admin created: admin@zanosa.com / adminpassword");
        }
    } catch (err) {
        console.error("Error:", err);
    } finally {
        await mongoose.disconnect();
    }
}

run();
