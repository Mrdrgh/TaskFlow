import {Request, Response, NextFunction} from "express";
import jwt from "jsonwebtoken";
import User from "../models/user.model";


export interface JwtPayload {
    id: string;
}

//@desc     Protect routes - verify JWT token
export const protect = async(req: Request, res: Response, next: NextFunction): Promise<void> => {
    let token: string | undefined;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {
            token = req.headers.authorization.split(' ')[1]

            const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

            req.user = await User.findById(decoded.id).select("-password");

            if (!req.user) {
                res.status(401).json({message: "Not authorized, user not found"});
                return;
            }
            next();
        } catch (error: any) {
            console.error(error);
            res.status(500).json({message: "internal server error, check console for more details"});
            return;
        }
    }

    if (!token) {
        res.status(401).json({message: "Not authorized, no token"});
        return;
    }
};