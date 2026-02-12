import { Request, Response } from "express";
import jwt from 'jsonwebtoken';
import User from "../models/user.model";

const generateToken = (id: string): string => {
    return jwt.sign({id}, process.env.JWT_SECRET as string);
};

export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password} = req.body;

        if (!name || !email || !password) {
            res.status(400).json({message: "Please provide all the informations"});
            return;
        }

        if (await User.exists({email})) {
            res.status(400).json({message: "User email already exists"});
            return;
        }

        const user = await User.create({
            name: name,
            email: email,
            password: password
        })

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id.toString()),
            });
        } else {
            res.status(400).json({message: "Invalid user data"})
        }
    } catch (error: any) {
        res.status(500).json({message: error.message});
    }
};

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;
        console.log(req.body);
        if (!email || !password) {
            res.status(400).json({message: "Please provide email and password"});
            return;
        }

        const user = await User.findOne({email}).select('+password');

        if (!user) {
            res.status(401).json({message: "Email or Password incorrect"})
            return;
        }

        if (!await user?.matchPassword(password)) {
            res.status(401).json({message: "Email or Password incorrect"})
            return;
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id.toString())
        });
    } catch (error: any) {
        res.status(500).json({message: error.message, stackTrace: error.stack});
    }
};

export const getMe = async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.user?._id);

        if (!user) {
            res.status(404).json({message: "User not found"});
        }
        res.json({
            _id: user?._id,
            name: user?.name,
            email: user?.email
        })
    } catch (error: any) {
        res.status(500).json({message: error.message});
    }
};