import express, { Request, Response, Application} from 'express';
import dotenv from "dotenv";
import cors from "cors";
import connectDB from './config/db';
import { uptime } from 'process';
import authRouter from './routes/auth.routes';
import taskRouter from './routes/task.routes';
import { initializeSocket } from './config/socket';
import { createServer } from "http"
dotenv.config();
connectDB();

const app: Application = express();

const httpServer = createServer(app);
//socket io server
const io = initializeSocket(httpServer);
//middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {console.log(`resolving request for path : ${req.method} ${req.url} ${req.body}`); next();})

app.get("/", (req: Request, res: Response) => {
    res.json({message: "API is running"});
})

app.get("/api/health", (_, res: Response) => {
    res.status(200).json({
        status: 'OK',
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    })
});

app.use('/api/auth', authRouter);
app.use('/api/tasks', taskRouter);

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
