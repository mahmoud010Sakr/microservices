import userModel from "../../database/model/user.model.js"
import cartModel from "../../database/model/cart.model.js"
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { AppError } from "../../utilts/errorHandling/AppError.js"
import { sendEmail } from '../../utilts/sendEmail.js'
import { handleAsyncError } from '../../utilts/errorHandling/handelAsyncError.js'
// import { mergeGuestCart } from '../cart/cart.service.js' // mo4kela hena TODO: 
import translations, { translate } from '../../utilts/translations.js'
import dotenv from 'dotenv'
dotenv.config();

// Helper to get language from request
function getLang(req) {
    return req.query.lang || req.headers['accept-language']?.split(',')[0]?.toLowerCase().startsWith('ar') ? 'ar' : 'en';
}

// dol elmfrod myb2o4 henaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
const calculateTotalPrice = (cart) => {
    cart.totalPrice = cart.cartItems.map(item => {
        return (item.priceAfterDiscount ?? item.price) * item.quantity;
    }).reduce((acc, curr) => acc + curr, 0);
    if (cart.discount) {
        cart.totalPriceAfterDiscount = cart.totalPrice - (cart.totalPrice * cart.discount) / 100;
        return cart.totalPriceAfterDiscount;
    }
    return cart.totalPrice;
};
export const mergeGuestCart = async (userId, sessionId) => { // elmfrood m4 hena 5alesssssssss TODO:
    try {
        const guestCart = await cartModel.findOne({ sessionId });
        let userCart = await cartModel.findOne({ user: userId });
        if (!guestCart) return;
        if (!userCart) {
            guestCart.user = userId;
            guestCart.sessionId = undefined;
            await guestCart.save();
            return;
        }
        for (const guestItem of guestCart.cartItems) {
            const existingItem = userCart.cartItems.find(
                item => item.product.toString() === guestItem.product.toString()
            );
            if (existingItem) {
                existingItem.quantity += guestItem.quantity;
            } else {
                userCart.cartItems.push(guestItem);
            }
        }
        calculateTotalPrice(userCart); 
        await userCart.save();
        // Delete guest cart
        await cartModel.findByIdAndDelete(guestCart._id);
    } catch (error) {
        console.error(translate("Error merging carts"), error);
    }
};

// dol elmfrod myb2o4 henaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa


const APPLE_KEYS_URL = 'https://appleid.apple.com/auth/keys';

const getApplePublicKeys = async () => {
    const response = await axios.get(APPLE_KEYS_URL);
    return response.data.keys;
};

const verifyAppleToken = async (identityToken) => {
    try {
        const appleKeys = await getApplePublicKeys();
        const decodedHeader = jwt.decode(identityToken, { complete: true });
        if (!decodedHeader) throw new AppError(translate("Invalid token"), 400);

        const key = appleKeys.find(k => k.kid === decodedHeader.header.kid);
        if (!key) throw new AppError(translate("Apple public key not found"), 400);

        const publicKey = jwt.verify(identityToken, jwt.jwkToPem(key), { algorithms: ['RS256'] });
        return publicKey;
    } catch (error) {
        throw new AppError(translate("Apple token verification failed", 401));
    }
};

export const appleAuth = handleAsyncError(async (req, res, next) => {
    const { identityToken } = req.body;
    if (!identityToken) throw new AppError(translate("Identity token is required"), 400);
    const decoded = await verifyAppleToken(identityToken);
    const { email, sub: appleId } = decoded;
    if (!email) throw new AppError(translate("Unable to retrieve email"), 400);
    let user = await userModel.findOne({ email });
    if (!user) {
        user = await userModel.create({ name: "Apple User", email, password: "", appleId, isVerified: true });
    }
    let token = jwt.sign({ id: user._id, email: user.email }, process.env.USER_SIGNATURE, { expiresIn: '7d' });
    res.cookie("User", token, {
        maxAge: 7 * 24 * 60 * 60 * 1000, // MS
        httpOnly: true,

    });

    return res.status(200).json({ message: translate("Apple Sign-In successful"), token });
});

export const signUp = handleAsyncError(async (req, res, next) => {
    let { name, email, confirmPassword, password, phone, role, confirmRule } = req.body;
    if (password !== confirmPassword) {
        throw new AppError(translate("Passwords do not match"), 400);
    }
    if (confirmRule !== true) {
        throw new AppError(translate("Confirm rule"), 400);
    }
    let exsistUser = await userModel.findOne({ email });
    if (exsistUser) {
        throw new AppError(("User already exists"), 400);
    }
    let hashedPassword = await bcrypt.hash(password, +process.env.HASH_SALT);
    let user = await userModel.create({ name, email, password: hashedPassword, phone, role, confirmRule });
    let token = jwt.sign({ id: user._id }, process.env.VERIFY_SIGNATURE, { expiresIn: '3m' });
    let confirmationLink = `http://${process.env.CLIENT_URL}/auth/confirm-email/${token}`;
    let html = `
<!DOCTYPE html>
                <html>
                <head>
                    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css"></head>
                <style type="text/css">
                body{background-color: #88BDBF;margin: 0px;}
                </style>
                <body style="margin:0px;"> 
                <table border="0" width="50%" style="margin:auto;padding:30px;background-color: #F3F3F3;border:1px solid #630E2B;">
                <tr>
                <td>
                <table border="0" width="100%">
                <tr>
                <td>
                <a href="www.google.com"  target="_blank" style="display: none;">www.google.com</a > 
                <h1>
                    <img width="100px" src="https://imgs.search.brave.com/sQKQlbEGmcJQ7Y3fwrRxzhodH-cHHOxvGE2-_FOYExc/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nZXR0eWltYWdl/cy5jb20vaWQvMTM3/NDg3NjMxOC9waG90/by9jbG9zZS11cC1v/Zi1tZWNoYW5pYy1p/bi10aXJlLXNlcnZp/Y2Utd29ya3Nob3At/Y2hhbmdpbmctdGly/ZS5qcGc_cz02MTJ4/NjEyJnc9MCZrPTIw/JmM9MUpxTEhEcEZY/OVVrT0dramYxZV83/STFVcXY3U0szN1Js/X1c3NDdVYUZacz0"/>
                </h1>
                </td>
                <td>
                <p style="text-align: right;"><a href="http://localhost:4200/#/" target="_blank" style="text-decoration: none;">View In Website</a></p>
                </td>
        
                </tr>
                </table>
                </td>
                </tr>
                <tr>
                <td>
                <table border="0" cellpadding="0" cellspacing="0" style="text-align:center;width:100%;background-color: #fff;">
                <tr>
                <td style="background-color:#630E2B;height:100px;font-size:50px;color:#fff;">
                <img width="50px" height="50px" src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703716/Screenshot_1100_yne3vo.png">
                </td>
                </tr>
                <tr>
                <td>
                <h1 style="padding-top:25px; color:#630E2B">Email Confirmation</h1>
                </td>
                </tr>
                <tr>
                <td>
                <p style="padding:0px 100px;">
                </p>
                </td>
                </tr>
                <tr>
                <td>
                <div> 
                <a href="${confirmationLink}" style="margin:10px 0px 30px 0px;border-radius:4px;padding:10px 20px;border: 0;color:#fff;background-color:#630E2B; ">Verify Email address</a>
                </div>
                </td>
                </tr>
                </table>
                </td>
                </tr>
                <tr>
                <td>
                <table border="0" width="100%" style="border-radius: 5px;text-align: center;">
                <tr>
                <td>
                <h3 style="margin-top:10px; color:#000">Stay in touch</h3>
                </td>
                </tr>
                <tr>
                <td>
                <div style="margin-top:20px;">

                <a href="${process.env.facebookLink}" style="text-decoration: none;"><span class="twit" style="padding:10px 9px;color:#fff;border-radius:50%;">
                <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group35062_erj5dx.png" width="50px" hight="50px"></span></a>
                
                <a href="${process.env.instegram}" style="text-decoration: none;"><span class="twit" style="padding:10px 9px;color:#fff;border-radius:50%;">
                <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group35063_zottpo.png" width="50px" hight="50px"></span>
                </a>
                
                <a href="${process.env.twitterLink}" style="text-decoration: none;"><span class="twit" style="padding:10px 9px;;color:#fff;border-radius:50%;">
                <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group_35064_i8qtfd.png" width="50px" hight="50px"></span>
                </a>

                </div>
                </td>
                </tr>
                </table>
                </td>
                </tr>
                </table>
                </body>
                </html>
    `;
    await sendEmail(user.email, html);
    return res.status(201).json({ message: translate("User registered. Please check your email to confirm your account.") });
});

export const confirmEmail = async (req, res, next) => {
    let { token } = req.params;
    let decoded = jwt.verify(token, process.env.VERIFY_SIGNATURE);
    if (!decoded) {
        throw new AppError(("Invalid token"), 400);
    }
    let user = await userModel.findById(decoded.id);
    if (!user) {
        throw new AppError(("User not found"), 400);
    }
    user.isVerified = true;
    await user.save();
    //TODO: lesa feha ta3deel 34an static 
    return res.redirect('https://front-ten-zeta-78.vercel.app');
};

export const login = handleAsyncError(async (req, res, next) => {
    let { identifier, password } = req.body;
    let user = await userModel.findOne({
        $or: [{ email: identifier }, { phone: identifier }]
    });
    if (!user) {
        throw new AppError(translate("User not found"), 400);
    }
    if (!user.isVerified) {
        throw new AppError(translate("Email not verified"), 400);
    }
    let isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ message: translate("Invalid credentials") });
    }
    let signature = '';
    let bearerKey = '';
    switch (user.role) {
        case 'Admin':
            signature = process.env.ADMIN_SIGNATURE;
            bearerKey = 'Admin';
            break;
        case 'Agent':
            signature = process.env.AGENT_SIGNATURE;
            bearerKey = 'Agent';
            break;
        case 'MC':
            signature = process.env.MC_SIGNATURE;
            bearerKey = 'MC';
            break;
        case 'User':
            signature = process.env.USER_SIGNATURE;
            bearerKey = 'User';
            break;
        case 'Support':
            signature = process.env.SUPPORT_SIGNATURE;
            bearerKey = 'Support';
            break;
        case 'SuperAdmin':
            signature = process.env.SADMIN_SIGNATURE;
            bearerKey = 'SAdmin';
            break;
        default:
            throw new AppError(translate("Invalid role", 400));
    }
    let token = jwt.sign({ id: user._id, name: user.name, role: user.role }, signature);



    mergeGuestCart(user._id, req.headers.sessionid);

    return res.status(200).json({ message: translate("Login successful"), token });
});

export const sendOTP = handleAsyncError(async (req, res, next) => {
    let { email } = req.body;
    let user = await userModel.findOne({ email });
    if (!user) {
        throw new AppError(translate("User not found"), 400);
    }
    let otp = Array.from({ length: 4 }, () => Math.floor(Math.random() * 10)).join('');
    user.otp = otp;
    console.log(otp);

    await user.save();
    let html = `
        <html>
        <body>
        <table border="0" cellpadding="0" cellspacing="0" style="text-align: center; width: 100%;">
        <tr>
        <td style="background-color: #88BDBF; height: 100px; font-size: 50px; color: #fff;">
        <img width="50px" height="50px" src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703716/Screenshot_1100_yne3vo.png">
        </td>
        </tr>
        <tr>
        <td>
        <h1 style="padding-top: 25px; color: #630E2B;">Reset Password</h1>
        </td>
        </tr>
        <tr>
        <td>
        <p style="padding: 0px 100px;">
        </p>
        </td>
        </tr>
        <tr>
        <td>
        <div>
        <h2 style="margin: 10px 0px 30px 0px; border-radius: 4px; padding: 10px 20px; border: 0; color: #fff; background-color: #630E2B;">${otp}</h2>
        </div>
        </td>
        </tr>
        </table>
        </body>
        </html> 
    `;
    await sendEmail(user.email, html);
    return res.status(200).json({ message: translate("Email sent successfully") });
});

export const resetPassword = handleAsyncError(async (req, res, next) => {
    let { email, otp, newPassword, rePassword } = req.body;
    let user = await userModel.findOne({ email });
    if (!user) {
        throw new AppError(translate("User not found"), 400);
    }
    if (newPassword) {
        if (newPassword !== rePassword) {
            throw new AppError(translate("Passwords do not match"), 400);
        }
        if (Number(user.otp) !== Number(otp)) {
            throw new AppError(translate("Invalid OTP"), 400);
        }
        let hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();


        let signature = '';
        let bearerKey = '';
        switch (user.role) {
            case 'Admin':
                signature = process.env.ADMIN_SIGNATURE;
                bearerKey = 'Admin';
                break;
            case 'Agent':
                signature = process.env.AGENT_SIGNATURE;
                bearerKey = 'Agent';
                break;
            case 'MC':
                signature = process.env.MC_SIGNATURE;
                bearerKey = 'MC';
                break;
            case 'User':
                signature = process.env.USER_SIGNATURE;
                bearerKey = 'User';
                break;
            case 'Support':
                signature = process.env.SUPPORT_SIGNATURE;
                bearerKey = 'Support';
                break;
            case 'SuperAdmin':
                signature = process.env.SADMIN_SIGNATURE;
                bearerKey = 'SAdmin';
                break;
            default:
                throw new AppError(translate("Invalid role", 400));
        }

        const token = jwt.sign({ id: user._id, name: user.name, role: user.role }, signature, { expiresIn: '7d' });


        return res.status(200).json({ message: translate("Password reset successfully"), token });
    }

    if (Number(user.otp) !== Number(otp)) {
        throw new AppError(translate("Invalid OTP"), 400);
    }

    return res.status(200).json({ message: translate("OTP verified successfully") });
});


export const checkAuth = (req, res) => {
    try {
        res.status(200).json(req.user);
    } catch (error) {
        console.log("Error in checkAuth controller", error.message);
        res.status(500).json({ message: translate("Internal server error") });
    }
};


export const logout = handleAsyncError(async (req, res, next) => {
    res.clearCookie('Admin');
    res.clearCookie('Agent');
    res.clearCookie('MC');
    res.clearCookie('User');
    res.clearCookie('Support');
    res.clearCookie('SAdmin');
    return res.status(200).json({ message: translate("Logout successful") });
})

export const dashbordLogin = handleAsyncError(async (req, res, next) => {
    let { identifier, password } = req.body;
    if (!identifier || !password) {
        throw new AppError(translate("Identifier or password is required"), 400);
    }
    let user = await userModel.findOne({
        $or: [{ email: identifier }, { phone: identifier }]
    });
    if (!user) {
        throw new AppError(translate("User not found"), 400);
    }

    if (!user.isVerified) {
        throw new AppError(translate("Email not verified"), 400);
    }
    console.log(user.role);
    let roles = ["Admin", "Agent", "MC"];
    const role = user.role.trim()
    console.log(role, "role");

    if (!roles.includes(role)) {
        throw new AppError(translate("Invalid role"), 400);
    }

    let isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
        throw new AppError(translate("Invalid password"), 400);
    }
    let signature = '';
    switch (user.role) {
        case 'Admin':
            signature = process.env.ADMIN_SIGNATURE;
            break;
        case 'Agent':
            signature = process.env.AGENT_SIGNATURE;
            break;
        case "MC":
            signature = process.env.MC_SIGNATURE;
            break;
        default:
            throw new AppError(translate("Invalid role", 400));
    }

    const token = jwt.sign({ id: user._id, name: user.name, role: user.role }, signature, { expiresIn: '7d' });
    return res.status(200).json({ message: translate("Login successful"), token });
})