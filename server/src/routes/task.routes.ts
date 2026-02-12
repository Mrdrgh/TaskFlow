import express, { Router } from "express";
import { protect } from "../middleware/auth.middleware";
import { createTask, deleteTask, getTaskById, getTasks, updateTask } from "../controllers/task.controller";

const taskRouter: Router = express.Router();

taskRouter.get('/', protect, getTasks);

taskRouter.get('/:id', protect, getTaskById);

taskRouter.post('/', protect, createTask);

taskRouter.put('/:id', protect, updateTask);

taskRouter.delete('/:id', protect, deleteTask);

export default taskRouter;