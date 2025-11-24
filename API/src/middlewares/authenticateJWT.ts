import {Response, Request, NextFunction} from "express";
import {AppDataSource} from "../services/db/database";
import {Token} from "../services/db/models/token";
import {verify} from "jsonwebtoken";
import dotenv from 'dotenv';
import {TypeRole} from "../services/enums";

dotenv.config();

export async function authenticateJWT(req: Request, res: Response, next: NextFunction) {
    try {
        const token = req.cookies.accessToken;

        if (!token) {
            return res.status(401).json({success: false, message: "Unauthorized: No token provided"});
        }

        const tokenRepository = AppDataSource.getRepository(Token);
        const tokenFound = await tokenRepository.findOne({where: {token}});

        if (!tokenFound) {
            return res.status(401).json({success: false, message: "Unauthorized: Token not recognized"});
        }

        const secret = process.env.SECRET;
        if (!secret) {
            console.error("JWT SECRET is not defined");
            return res.status(500).json({success: false, message: "Internal server error"});
        }

        verify(token, secret, (err: any, user: any) => {
            if (err) {
                return res.status(401).json({success: false, message: "Unauthorized: Token invalid or expired"});
            }

            res.locals.user = user;
            return next();
        });

    } catch (error) {
        if (error instanceof Error) {
            console.error(error.message);
        }
        return res.status(500).send({success: false, message: "Internal server error"});
    }
}

export function authorize(roles: TypeRole[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!roles.includes(res.locals.user.role)) {
            return res.status(403).json({success: false, message: 'Access Forbidden'});
        }
        return next();
    };
}
