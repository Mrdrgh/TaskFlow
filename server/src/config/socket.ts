import { Server as HTTPServer} from "http";
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { JwtPayload, SocketAuthenticate } from "../middleware/auth.middleware";
import User from "../models/user.model";

export interface AuthenticatedSocket extends Socket {
    user?: {
        _id: string;
        name: string;
        email: string;
    };
};


let io: Server;

export const initializeSocket = (httpServer: HTTPServer): Server => {
    io = new Server(httpServer, {
        cors: {
            origin: process.env.CLIENT_URL || "http://localhost:5173",
            credentials: true
        },
    });

    io.use(SocketAuthenticate);


    io.on("connection", (socket: AuthenticatedSocket) => {
        console.log(`User connected: ${socket.user?._id} (${socket.id})`);

        socket.join(`user:${socket.user?._id}`);

        socket.emit('connected', {
            message: 'connected to TaskFlow',
            user: socket.user
        });

        socket.on("disconnect", () => {
            console.log(`user disconnected ${socket.user?._id} (${socket.id})`);
        });
    })

    return io;
}

export const getIO = (): Server => {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
};