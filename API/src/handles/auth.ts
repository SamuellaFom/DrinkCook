import {Request, Response} from "express";
import {compare, hash} from "bcrypt";
import {sign, verify} from "jsonwebtoken";
import {LoginUserValidation} from "../services/validators/auth-validator";
import {GetUserValidation} from "../services/validators/backOffice/user-valid";
import {AppDataSource} from "../services/db/database";
import {User} from "../services/db/models/user";
import {Token} from "../services/db/models/token";
import dotenv from 'dotenv';
import {generateValidationErrorMessage} from "../services/validators";

dotenv.config();

export async function login(req: Request, res: Response) {
    try {
        const validation = LoginUserValidation.validate(req.body);
        if (validation.error) {
            res.status(400).send({success: false, message: generateValidationErrorMessage(validation.error.details)})
            return
        }

        const loginRequest = validation.value
        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOne({
            where: {email: loginRequest.email},
            relations: ["franchise"],

        })

        if (user === null) {
            res.status(400).send({success: false, message: "Email or password is incorrect"});
            return
        }

        const isValid = await compare(loginRequest.password, user.password);
        if (!isValid) {
            res.status(400).send({success: false, message: "Email or password is incorrect"});
            return
        }

        const secret = process.env.SECRET;
        if (!secret) {
            console.error("JWT SECRET is not defined");
            res.status(500).send({success: false, message: "Internal server error"});
            return
        }

        const accessToken = sign({
            userId: user.id,
            role: user.role.type,
            franchiseId: user.franchise?.id ?? null
        }, secret, {expiresIn: '5m'})
        const refreshToken = sign({
            userId: user.id,
            role: user.role.type,
            franchiseId: user.franchise?.id ?? null
        }, secret, {expiresIn: '5d'})

        const tokenRepository = AppDataSource.getRepository(Token)
        await tokenRepository.save({
            token: accessToken,
            user: user
        });

        await tokenRepository.save({
            token: refreshToken,
            user: user
        });

        res.cookie('accessToken', accessToken, {
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: 60 * 60 * 1000
        });

        res.cookie('refreshToken', refreshToken, {
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: 5 * 24 * 60 * 60 * 1000
        });

        res.status(201).json({success: true, message: "Logged in successfully"});

    } catch (error) {
        if (error instanceof Error) {
            console.log(error.message)
        }
        res.status(500).send({success: false, message: "Internal error"})
    }
}

export async function logout(req: Request, res: Response) {
    try {
        const validation = GetUserValidation.validate({id: res.locals.user.userId});
        if (validation.error) {
            res.status(400).send({success: false, message: generateValidationErrorMessage(validation.error.details)});
            return
        }

        const logoutRequest = validation.value;
        const userRepository = AppDataSource.getRepository(User);
        const tokenRepository = AppDataSource.getRepository(Token);

        const user = await userRepository.findOne({where: {id: logoutRequest.id}});
        if (user === null) {
            res.status(404).send({success: false, message: `user ${logoutRequest.id} not found`});
            return
        }

        await tokenRepository.delete({user: {id: user.id}});

        res.status(200).send({success: true, message: "user logged out, all tokens deleted"});

    } catch (error) {
        if (error instanceof Error) {
            console.log(error.message)
        }
        res.status(500).send({success: false, message: "Internal server error"});
    }
}

export async function refreshToken(req: Request, res: Response) {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            res.status(401).send({success: false, message: 'Refresh token missing'});
            return;
        }

        const secret = process.env.SECRET;
        if (!secret) {
            console.error("JWT SECRET is not defined");
            res.status(500).send({success: false, message: "Internal server error"});
            return;
        }

        const tokenRepository = AppDataSource.getRepository(Token);
        const tokenRecord = await tokenRepository.findOne({where: {token: refreshToken}});

        if (!tokenRecord) {
            res.status(403).send({success: false, message: 'Invalid refresh token'});
            return;
        }

        verify(refreshToken, secret, async (err: any, decoded: any) => {
            if (err) {
                res.status(403).send({success: false, message: 'Invalid refresh token'});
                return;
            }

            const userRepository = AppDataSource.getRepository(User);
            const user = await userRepository.findOne({
                where: {id: decoded.userId},
                relations: ["franchise"],
            });

            if (!user) {
                res.status(404).send({success: false, message: "User not found"});
                return;
            }

            const newAccessToken = sign({
                userId: user.id,
                role: user.role.type,
                franchiseId: user.franchise?.id ?? null
            }, secret, {expiresIn: '5m'});

            const newRefreshToken = sign({
                userId: user.id,
                role: user.role.type,
                franchiseId: user.franchise?.id ?? null
            }, secret, {expiresIn: '5d'});

            await tokenRepository.delete({user: {id: user.id}});

            await tokenRepository.save({token: newRefreshToken, user});

            await tokenRepository.save({token: newAccessToken, user});

            res.cookie('refreshToken', newRefreshToken, {
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                path: `/`,
                maxAge: 5 * 24 * 60 * 60 * 1000
            });

            res.cookie('accessToken', newAccessToken, {
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                path: `/`,
                maxAge: 60 * 60 * 1000
            });

            res.status(200).send({
                success: true
            });
        });

    } catch (error) {
        if (error instanceof Error) {
            console.error(error.message);
        }
        res.status(500).send({success: false, message: "Internal error"});
    }
}