import express from 'express';
import { checkRole } from '../../utilts/midlleware/role.js';
import { auth } from '../../utilts/midlleware/auth.js';
import { CheckoutWithTap, createStripeRefund, createCashOrder, createCheckOutSession, getAllOrders, getOrderById, getUserOrders, handleTapWebhook } from './order.service.js';

const router = express.Router();


router.get('/get-all-orders-for-admin', auth, checkRole('Admin'), getAllOrders);

router.get('/get-user-orders', auth, checkRole('User', 'Admin'), getUserOrders);

router.post('/create-cash-order/:cartId', auth, checkRole('User', 'Admin'), createCashOrder);

router.post('/checkOut-session', auth, createCheckOutSession);

router.post('/pay/:cartId', auth, CheckoutWithTap);

router.get('/get-order-by-id/:orderId', auth, checkRole("User", "Admin"), getOrderById);

router.post('/refund-stripe', auth, createStripeRefund);

export default router;