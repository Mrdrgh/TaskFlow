const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please provide a name"],
        trim: true
    },
    email: {
        type: String,
        required: [true, "Please provide the email"],
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"]
    },
    password: {
        type: String,
        required: [true, "Please provide a password"],
        minlength: 8,
        select: false
    }
}, {
    timestamps: true
});


userSchema.pre('save', async function(next) {
    if (!this.isModified("password")) {
        next();
    }
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function(password) {
    return await bcrypt.hash(password, this.password);
}

module.exports = mongoose.model("User", userSchema);