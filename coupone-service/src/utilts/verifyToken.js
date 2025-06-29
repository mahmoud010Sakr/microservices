import jwt from 'jsonwebtoken'
import userModel from '../../Database/models/user.model.js';


export const auth = async (req, res , next) => {
    let { authorization } = req.headers
    if (!authorization) {
        return res.status(400).json({ error: "Authorization header missing" })
    }
    let [bearer, token] = authorization.split(" ") || []
    if (bearer !== "Bearer") {
        return res.status(400).json({ error: "Invalid authorization header" })
    }
    if (!token) {
        return res.status(400).json({ error: "Invalid token" })
    }
    let decoded = jwt.verify(token, process.env.JWT_SECRET)
    if (!decoded) {
        return res.status(400).json({ error: "Invalid token" })
    }
    let user = await userModel.findById(decoded.id)
    if (!user) {
        return res.status(400).json({ error: "User not found" })
    }
    req.user = decoded
    next()
}