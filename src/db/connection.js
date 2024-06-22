const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const response = await mongoose.connect(process.env.MONGO_URI);
        console.log("❄️  DataBase Running on Port: ", response.connection.port);
    } catch (error) {
        console.log("🌋 Error Connecting DataBase", error.message);
        process.exit(1);
    }
}
module.exports = connectDB;