import jwt from 'jsonwebtoken';
import userModel from '../database/model/user.model.js';
import { AppError } from '../errorHandling/AppError.js';
import crypto from 'crypto';

export const optionalAuth = async (req, res, next) => {
    try {
        console.log(req.headers.sessionid);
        
        let authorization = req.headers.authorization;
        if (!authorization) {
            const roles = [
                "Admin",
                "Agent",
                "Maintenance_Center",
                "User",
                "Support",
                "SuperAdmin"
            ];

            for (const role of roles) {
                if (req.cookies[role]) {
                    authorization = `${role} ${req.cookies[role]}`;
                    break;
                }
            }
        }

        if (!authorization) {
            if (!req.headers.sessionid) {
                return res.json({ message: "Session id or token is required" });
            }
            return next();
        }

        const [bearer, token] = authorization.split(" ") || [];
        if (!bearer || !token) {
            return next();
        }

        let signature;
        switch (bearer) {
            case process.env.ADMIN_BREAR:
                signature = process.env.ADMIN_SIGNATURE;
                break;
            case process.env.AGENT_BEREAR:
                signature = process.env.AGENT_SIGNATURE;
                break;
            case process.env.MC_BEARER:
                signature = process.env.MC_SIGNATURE;
                break;
            case process.env.USER_BEREAR:
                signature = process.env.USER_SIGNATURE;
                break;
            case process.env.SUPPORT_BEREAR:
                signature = process.env.SUPPORT_SIGNATURE;
                break;
            case process.env.SUPER_ADMIN_BEREAR:
                signature = process.env.SUPER_ADMIN_SIGNATURE;
                break;
            default:
                return next();
        }
        const decoded = jwt.verify(token, signature);
        const user = await userModel.findById(decoded.id);
        if (!user) {
            return next();
        }
        req.user = user;
        next();
    } catch (error) {
        next();
    }
};
