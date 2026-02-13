import { Server as HTTPServer} from "http";
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { JwtPayload } from "../middleware/auth.middleware";
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

    io.use()

}