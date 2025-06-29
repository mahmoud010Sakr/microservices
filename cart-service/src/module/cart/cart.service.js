import mongoose from "mongoose";
import cartModel from "../../database/model/cart.model.js";
import productModel from "../../database/model/product.model.js";
import { AppError } from "../../utilts/errorHandling/AppError.js";
import { handleAsyncError } from "../../utilts/errorHandling/handelAsyncError.js";
import brandModel from "../../database/model/brand.model.js";
import tagModel from "../../database/model/tag.model.js";
import couponModel from "../../database/model/copoune.model.js";
import crypto from 'crypto';
import AgentProduct from "../../database/model/agentProducts.js";

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
export const addProductToCart = handleAsyncError(async (req, res, next) => {
    let { productId, quantity } = req.body;
    if (!mongoose.Types.ObjectId.isValid(productId)) {
        return next(new AppError(req.__("Invalid product id"), 400));
    }
    const product = await AgentProduct.findById(productId)
    .populate('agentId')
    .populate('brandId')
    .populate('tags')
    .select('price stock name priceAfterDiscount agentId ');
    console.log(product);
    if (!product) return next(new AppError(req.__("Product does not exist"), 404));
    if (product.stock <= quantity) return next(new AppError(req.__("Insufficient stock"), 400));
    let cart;
    let query = {};
    if (req.user) {
        query.user = req.user._id;
    } else {
        // Guest user
        let sessionId = req.headers.sessionid;
        if (!sessionId) {
            return res.json({ message: { en: "you must to signup", ar: "يجب عليك التسجيل" } });
        }
        query.sessionId = sessionId;
    }
    cart = await cartModel.findOne(query);
    if (!cart) {
        cart = await cartModel.create({
            ...query,
            cartItems: [{
                product: productId,
                quantity: quantity || 1,
                price: product.price,
                priceAfterDiscount: product.priceAfterDiscount,
                brandId: product.brandId,
                agentId: product.agentId,
                tags: product.tags
            }]
        });
    } else {
        const existingItem = cart.cartItems.find(item => item.product && item.product.toString() === productId.toString());
        if (existingItem) {
            existingItem.quantity += quantity || 1;
        } else {
            cart.cartItems.push({
                product: productId,
                quantity: quantity || 1,
                price: product.price,
                priceAfterDiscount: product.priceAfterDiscount,
                brandId: product.brandId,
                agentId: product.agentId,
                tags: product.tags
            });
        }
    }

    calculateTotalPrice(cart);
    await cart.save();
    res.status(201).json({ message: { en: req.__("Product added to cart"), ar: req.__("Product added to cart") }, cart });
});

export const removeProductFromCart = handleAsyncError(async (req, res, next) => {
    let { id } = req.params;
    const query = req.user ? { user: req.user._id } : { sessionId: req.headers.sessionid };
    const cart = await cartModel.findOne(query);
    const itemIndex = cart.cartItems.findIndex(item => item.product.toString() === id);
    if (itemIndex === -1) return next(new AppError(req.__("Item not found in cart"), 404));
    cart.cartItems.splice(itemIndex, 1);
    if (!cart) return next(new AppError(req.__("Cart not found"), 404));
    calculateTotalPrice(cart);
    if (cart.cartItems.length === 0) {
        cart.discount = 0;
    }
    await cart.save();
    res.status(200).json({ message: req.__("Product removed from cart"), cart });
});

export const getUserCart = handleAsyncError(async (req, res, next) => {
    
    const query = req.user ? { user: req.user._id } : { sessionId: req.headers.sessionid };
    console.log(query, 'this is the query');
    if (req.user) {
        console.log(req.user , "userrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr");
        
        console.log('user cart');
        const cart = await cartModel.findOne(query).populate('cartItems.product');
        console.log(cart , "CAAAAART");
        
        if (cart) {
            return res.status(200).json({ message: req.__("success"), cart });
        }
    } else if (req.headers.sessionid) {
        const cart = await cartModel.findOne({ sessionId: req.headers.sessionid }).populate('cartItems.product');
        if (cart) {
            return res.status(200).json({ message: req.__("success"), cart });
        }
    }
    return next(new AppError(req.__("Cart not found"), 404));
});

export const updateProductQuantity = handleAsyncError(async (req, res, next) => {
    let { quantity } = req.body;
    const query = req.user ? { user: req.user._id } : { sessionId: req.headers.sessionid };
    const cart = await cartModel.findOne(query);
    if (!cart) return next(new AppError(req.__("Cart not found"), 404));
    const item = cart.cartItems.find(item => item.product.toString() === req.params.id);
    if (!item) return next(new AppError(req.__("Product not found in cart"), 404));
    item.quantity = quantity;
    calculateTotalPrice(cart);
    await cart.save();
    res.status(200).json({ message: { en: req.__("Product quantity updated"), ar: req.__("Product quantity updated") }, cart });
});

export const deleteUserCart = handleAsyncError(async (req, res, next) => {
    const query = req.user ? { user: req.user._id } : { sessionId: req.headers.sessionid };
    const cart = await cartModel.findOneAndDelete(query);
    if (!cart) return next(new AppError(req.__("Cart not found"), 404));
    res.status(200).json({ message: req.__("Cart deleted successfully") });
});

export const applyCoupon = handleAsyncError(async (req, res, next) => {
    const { code } = req.body;
    const coupon = await couponModel.findOne({ code, expires: { $gt: Date.now() } });
    if (!coupon) return res.status(404).json({ message: req.__("Coupon is expired or invalid") });
    const query = req.user ? { user: req.user._id } : { sessionId: req.headers.sessionId };
    const cart = await cartModel.findOne(query);
    if (!cart) return next(new AppError(req.__("Cart not found"), 404));
    cart.discount = coupon.discount;
    cart.totalPriceAfterDiscount = cart.totalPrice - (cart.totalPrice * coupon.discount) / 100;
    await cart.save();
    res.status(200).json({ message: req.__("Coupon applied successfully"), cart });
});

// Function to merge guest cart with user cart after login
export const mergeGuestCart = async (userId, sessionId) => {
    try {
        // Find guest cart and user cart
        const guestCart = await cartModel.findOne({ sessionId });
        let userCart = await cartModel.findOne({ user: userId });

        // If no guest cart exists, nothing to merge
        if (!guestCart) return;

        // If user has no cart, convert guest cart to user cart
        if (!userCart) {
            guestCart.user = userId;
            guestCart.sessionId = undefined;
            await guestCart.save();
            return;
        }

        // Merge cart items
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

        // Update cart totals
        calculateTotalPrice(userCart);
        await userCart.save();

        // Delete guest cart
        await cartModel.findByIdAndDelete(guestCart._id);
    } catch (error) {
        console.error(req.__("Error merging carts"), error);
    }
};


export const getSessionId = handleAsyncError(async (req, res, next) => {
    const sessionId = crypto.randomBytes(16).toString('hex');
    console.log(sessionId);
    const cookieOptions = {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: 'none',
        secure: true,
    };
    res.json({ 'sessionId': sessionId, cookieOptions });
});



