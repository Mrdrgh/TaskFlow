import {Request, Response} from "express";
import { TaskPriority, TaskStatus } from "../models/task.model";
import jwt from "jsonwebtoken";
import {JwtPayload} from "../middleware/auth.middleware"
import Task from "../models/task.model";
import User from "../models/user.model";
import {constants} from "../constants";
import { Types } from "mongoose";
import { getIO } from "../config/socket";

export const getTasks = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || constants.pagination.PAGE_INDEX_DEFAULT;
        const limit = parseInt(req.query.limit as string) || constants.pagination.PAGE_LIMIT_DEFAULT;

        const skip = (page - 1) * limit

        const tasks = await Task.find({assignedTo: req.user?._id})
            .populate('assignedTo', 'name email')
            .sort({createdAt: -1})
            .skip(skip)
            .limit(limit);
        
        res.json({
            count: tasks.length,
            data: tasks
        });
    } catch(error: any) {
        console.log(error.stack);
        res.status(500).json({
            message: error.message
        })
    }
}

// @desc    get single task by id by user
// @route   GET /api/tasks/:id
// @access  private    
export const getTaskById = async (req: Request, res: Response): Promise<void> => {
    try {
        const task = await Task.findById(req.params.id).
            populate('assignedTo', constants.task.ASSIGNED_TO_POPULATION_POLICY);
        
        if (!task) {
            res.status(404).json({message: "Task not found, id not valid"});
            return;
        }

        if (task.assignedTo._id.toString() !== req.user?._id.toString()) {
            res.status(403).json({message: "Forbidden, not authorized to access this task"})
            return;
        }
        
        res.json({
            data: task
        })
    } catch(error: any) {
        console.error(error.trace);
        res.status(500).json({message: error.message});
    }
};

export const createTask = async (req: Request, res: Response): Promise<void> => {
    try {
        const {title, description, status, priority, dueDate} = req.body;

        //title is required by mongo
        if (!title) {
            res.status(400).json({message: "Please provide a task title"});
            return;
        }

        let task = await Task.create({
            title,
            description,
            status: status || constants.task.STATUS_DEFAULT,
            priority: priority || constants.task.PRIORITY_DEFAULT,
            dueDate,
            assignedTo: req.user?._id
        });

        task = await Task.populate('assignedAt', constants.task.ASSIGNED_TO_POPULATION_POLICY)

        const io = getIO();
        io.to(`user:${req.user?._id}`).emit('task:created', {task, message: "New task created"});
        res.status(201).json({
            data: task
        });
    } catch(error: any) {
        console.error(error.trace)
        res.status(500).json({message: error.message})
    }
};


// @route PUT /api/tasks/:id
export const updateTask = async (req: Request, res: Response): Promise<void> => {
    try {
        let task = await Task.findById(req.params.id)

        if (!task) {
            res.status(404).json({
                message: "no task found with id: " + req.params.id
            });
            return;
        }

        if (task.assignedTo.toString() !== req.user?._id.toString()) {
            res.status(403).json({message: "Forbiddent, task not authorized to modify"})
            return;
        }

        task = await Task.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true}).populate(constants.task.ASSIGNED_TO_POPULATION_POLICY);
        const io = getIO();
        io.to(`user:${req.user._id}`).emit('task:updated', {task, message: `task ${task?.title} updated`});
        res.json({
            data: task
        });
    } catch (error: any) {
        console.error(error.trace);
        res.status(500).json({message: error.message})
    }
}


// @route   DELETE /api/tasks/:id
export const deleteTask = async (req: Request, res: Response): Promise<void> => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            res.status(404).json({message: "no task found with id : " + req.params.id});
            return;
        }

        if (task.assignedTo._id.toString() !== req.user?._id.toString()) {
            res.status(403).json({message: "not authorized, not your task to delete!"});
            return;
        }

        const io = getIO();
        io.to(`user:${req.user._id}`).emit("task:deleted", {taskId: req.params.id, message: "task deleted"});
        await task.deleteOne();

    } catch(error: any) {
        console.error(error.trace);
        res.status(500).json({
            message: error.message
        });
    }
};