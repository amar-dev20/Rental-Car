import mongoose from "mongoose";

const connectDB = async () => {
try {
await mongoose.connect(`${process.env.MONGODB_URI}/car-rental`);

console.log("Database Connected");


} catch (error) {
console.error("Database Connection Failed:", error.message);
throw error;
}
};

export default connectDB;
