const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDb = require("./config/db")


dotenv.config()
connectDb()

const app = express();

app.use(express.json())
app.use(cors())

app.get("/", (req, res) => {
    res.json({message: "TaskFlow api running.."});
})

const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
});
