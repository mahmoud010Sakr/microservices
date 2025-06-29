import express from 'express';
import { addProductToCart, removeProductFromCart, getUserCart, updateProductQuantity, deleteUserCart, applyCoupon, getSessionId } from './cart.service.js';
import { optionalAuth} from '../../utilts/midlleware/optionalAuth.js';
import { validation } from '../../utilts/validation.js';
import { addProductToCartSchema, removeProductFromCartSchema, updateProductQuantitySchema, applyCouponSchema } from './cart.validation.js'
import Joi from 'joi';

const router = express.Router();
router.post('/add-product', optionalAuth, validation({ body: addProductToCartSchema }), addProductToCart);
router.delete('/remove-product/:id', optionalAuth, validation({ params: removeProductFromCartSchema }), removeProductFromCart);
router.get('/get-user-cart', optionalAuth, getUserCart);
router.put('/update/:id', optionalAuth, validation({
    params: Joi.object({ id: updateProductQuantitySchema.extract('id') }),
    body: Joi.object({ quantity: updateProductQuantitySchema.extract('quantity') })
}), updateProductQuantity);
router.delete('/delete', optionalAuth, deleteUserCart);
router.post('/apply-coupon', validation({ body: applyCouponSchema }), optionalAuth, applyCoupon);
router.get('/get-session-id', getSessionId);

export default router;