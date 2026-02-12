const mongoose = require("mongoose")

const taskSchema = mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a task title'],
        trim: true,
        maxlength: [100, "Title cannot be more than 100 caracters"]
    },
    description: {
        type: String,
        trim: true,
        maxlength: [1000, "description too long"]
    },
    status: {
        type: String,
        enum: ["pending", "in progress", "completed", "failed"],
        default: "pending"
    },
    priority: {
        type: String,
        enum: ["low", "meduim", "high"],
        default: "meduim"
    },
    dueDate: {
        type: Date
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Task', taskSchema);