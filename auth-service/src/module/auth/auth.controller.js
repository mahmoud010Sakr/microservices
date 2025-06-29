import { Router } from 'express';
import { validation } from '../../utilts/validation.js';
import { loginSchema, signUpSchema } from './auth.validation.js';
import { appleAuth, checkAuth, confirmEmail, dashbordLogin, login, logout, resetPassword, sendOTP, signUp } from './auth.service.js';
import { auth } from '../../utilts/midlleware/auth.js';

const router = Router(
    {
        mergeParams: true,
        strict: true
    }
);
//TODO: lesa 3aleha 7aba 
router.post('/appleAuth', appleAuth);
//TODO: lesa 3aleha 7aba 
router.post('/signUp', validation({ body: signUpSchema }), signUp);
router.post('/login', validation({ body: loginSchema }), login);
router.post("/sendOTP", sendOTP);
router.get('/confirm-email/:token', confirmEmail);
router.patch("/resetPassword", resetPassword);
router.get("/check", auth, checkAuth);
router.post('/logout', auth, logout)
router.post('/dashbord-login', dashbordLogin)

export default router