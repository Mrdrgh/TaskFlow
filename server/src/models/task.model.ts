import mongoose, { Document, Schema, Types } from "mongoose";

export enum TaskStatus {
    TODO = "todo",
    IN_PROGRESS = "in-progress",
    COMPLETED = "completed"
}

export enum TaskPriority {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high"
}

export interface ITask extends Document {
    title: string,
    description?: string,
    status: TaskStatus,
    priority: TaskPriority,
    assignedTo: Types.ObjectId,
    dueDate?: Date,
    createdAt: Date,
    updatedAt: Date
}

const taskSchema: Schema<ITask> = new Schema<ITask> ({
    title: {
        type: String,
        required: [true, "please Provide a title"],
        trim: true
    },
    description: {
        type: String,
        trim: false,
        maxlength: [500, "Description too long"],
    },
    status: {
        type: String,
        enum: Object.values(TaskStatus),
        default: TaskStatus.TODO
    },
    priority: {
        type: String,
        enum: Object.values(TaskPriority),
        default: TaskPriority.MEDIUM
    },
    assignedTo: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, "task must be assigned to a user"]
    },
    dueDate: {
        type: Date,
    }
}, {
    timestamps: true
});

taskSchema.index({assignedTo: 1, status: 1});
const Task = mongoose.model("Task", taskSchema);

export default Task;