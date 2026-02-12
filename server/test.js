const mongoose = require("mongoose");
const User = require("./models/user");
const dotenv = require("dotenv")

dotenv.config()
const testDb = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
    } catch(error) {
        console.error("error: " + error.message)
        process.exit(1);
    } 

    const testUser = await User.create({
        name: "darghal mohammed", email: "mrdrgh@gmail.com", password: "sickomodeactive"
    });
    console.log("user created : " + testUser);

    const founduser = User.findOne({name: "darghal mohammed"});
    console.log("found user: " + founduser);
    // await User.deleteOne({name: "darghal mohammed"});
    // console.log("test user has been deleted");
    await User.deleteMany({name: /^darghal.*mohammed$/i});


    console.log("all users in the database are : " + await User.find().select("name"))
    process.exit();
}
testDb();