import { Server as HTTPServer} from "http";
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { JwtPayload, SocketAuthenticate } from "../middleware/auth.middleware";
import User from "../models/user.model";
import { ObjectId } from "mongoose";
import { eventService } from "../services/event.service";
import { timestamp } from "rxjs";

export interface AuthenticatedSocket extends Socket {
    user?: {
        _id: string;
        name: string;
        email: string;
    };
};


let io: Server;
export const initializeSocket = (httpServer: HTTPServer): Server => {
    let connectedUsers: Array<string> = new Array<string>;
    io = new Server(httpServer, {
        cors: {
//            origin: process.env.CLIENT_URL || "http://localhost:5500",
            origin: "*",
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    io.use(SocketAuthenticate);


    io.on("connection", (socket: AuthenticatedSocket) => {
        if (connectedUsers && connectedUsers.includes(socket.user?._id as string)) {
            console.log(`Socket session (${socket.id}) cannot be established for user ${socket.user?._id}: this user already has an active socket session`);
            //return;
        }
        console.log(`User connected: ${socket.user?._id} (${socket.id})`);

        socket.join(`user:${socket.user?._id}`);
        connectedUsers.push(socket.user?._id as string);
        socket.emit('connected', {
            message: 'connected to TaskFlow',
            user: socket.user
        });

        const subscription = eventService.getUserEvents(socket.user?._id as string)
                            .subscribe((event) => {
                                socket.emit(event.type, {
                                    data: event.data,
                                    timestamp: event.timestamp
                                })
                            });
        socket.on("disconnect", () => {
            connectedUsers.splice(connectedUsers.indexOf(socket.user?._id as string), 1)
            console.log(`user disconnected ${socket.user?._id} (${socket.id})`);
            subscription.unsubscribe();
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