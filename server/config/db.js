const mongoose = require("mongoose");


async function connectDb() {
    try {
        const connectDb = mongoose.connect(process.env.MONGODB_URI);
        console.log("Mongodb Connected");
    } catch(error) {
        console.error("Error : " + error.message);
        process.exit(1);
    }
};

module.exports = connectDb