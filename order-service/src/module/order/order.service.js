import { handleAsyncError } from "../../utilts/errorHandling/handelAsyncError.js";
import orderModel from '../../database/model/order.model.js';
import cartModel from '../../database/model/cart.model.js';
import productModel from '../../database/model/product.model.js';
import { AppError } from '../../utilts/errorHandling/AppError.js';
import Stripe from 'stripe';
import userModel from '../../database/model/user.model.js';
import AgentProduct from '../../database/model/agentProducts.js'
import axios from "axios";
import dotenv from 'dotenv';
import { format } from "winston";

dotenv.config();


function formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // +1 because months are 0-indexed
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

const stripe = new Stripe(process.env.MOD === "DEV" ? process.env.STRIPE_SK_TEST : process.env.STRIPE_SK_PROD);


const createCashOrder = handleAsyncError(async (req, res, next) => {
    const { cartId } = req.params;
    const { id } = req.user;
    const { serviceType, shippingAddress } = req.body;
    const cart = await cartModel.findById(cartId);
    console.log(cart);
    let prodsId = []
    if (!cart) return next(new AppError('Cart is empty', 404));
    const totalPrice = cart.totalPriceAfterDiscount || cart.totalPrice;
    for (const item of cart.cartItems) {
        prodsId.push(item.product)
        const product = await AgentProduct.findById(item.product);
        if (!product) return next(new AppError(`Product ${item.product} not found`, 404));
        if (product.stock <= 0) return next(new AppError(`Product ${product.name || item.product} is out of stock`, 400));
        if (product.stock < item.quantity) return next(new AppError(`Insufficient stock for ${product.name || item.product}. Available: ${product.stock}, Requested: ${item.quantity}`, 400));
    }
    const order = new orderModel({
        userId: id,
        productId: prodsId,
        cartId: cartId,
        totalOrderPrice: totalPrice,
        serviceType,
        shippingAddress: req.body.shippingAddress,
    });

    await order.save();
    if (order) {
        const options = cart.cartItems.map(item => ({
            updateOne: {
                filter: { _id: item.product },
                update: { $inc: { stock: -item.quantity, sold: item.quantity } }
            }
        }));
        await productModel.bulkWrite(options);
        const deletedCart = await cartModel.findByIdAndDelete(cartId);
        return res.status(201).json({ message: 'success', order, data: deletedCart });
    }
    return next(new AppError('No cart to order', 404));
});
const getAllOrders = handleAsyncError(async (req, res, next) => {
    const orders = await orderModel
        .find()
        .populate({
            path: 'productId',
            model: 'agentProduct'
        });

    if (!orders.length) return next(new AppError("No orders found", 404));
    res.status(200).json({ message: 'success', orders });
});
const getUserOrders = handleAsyncError(async (req, res, next) => {
    const orders = await orderModel.find({ userId: req.user._id })
        .populate({
            path: 'productId',
            model: 'AgentProduct'
        });
    if (!orders.length) return next(new AppError("No orders found", 404));
    res.status(200).json({ message: 'success', orders });
});

const createCheckOutSession = handleAsyncError(async (req, res, next) => {
    const { cartId } = req.query;
    const { productId } = req.query
    const { shippingAddress, serviceType, quantity } = req.body;

    let totalPrice;
    if (productId) {
        const product = await productModel.findById(productId);
        if (!product) return next(new AppError('Product not found', 404));
        totalPrice = product.price * quantity;

    }

    if (cartId) {
        const cart = await cartModel.findById(cartId);
        if (!cart) return next(new AppError('Cart not found or is empty', 404));
        totalPrice = cart.totalPriceAfterDiscount || cart.totalPrice;
    }

    if (!totalPrice) return next(new AppError('No cart or product found', 404));
    const session = await stripe.checkout.sessions.create({
        line_items: [
            {
                price_data: {
                    currency: 'SAR',
                    unit_amount: totalPrice * 100,
                    product_data: { name: req.user.name }
                },
                quantity: 1
            }
        ],
        mode: 'payment',
        success_url: `${process.env.FRONTEND_URL}/#/payment/success`,
        cancel_url: `${process.env.FRONTEND_URL}/#/payment/failed`,
        customer_email: req.user.email,
        client_reference_id: cartId || productId,
        metadata: {
            cartId,
            productId,
            shippingAddress: JSON.stringify(shippingAddress),
            serviceType
        }
    });

    res.status(201).json({
        message: 'success',
        url: session.url,
        paymentId: session.id,
        paymentIntentId: session.payment_intent
    });
});

const createOnlineOrder = handleAsyncError(async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let event;
    console.log(sig);

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
        //TODO: el webhook m4 bysama3 
        console.log(`✅ Webhook event received: ${event.type}`);
    } catch (err) {
        console.error(`❌ Webhook signature verification failed: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        console.log(`🛒 Processing order for session: ${session.id}`);
        await handleWebHookEvent(session);
    }

    res.status(200).end();
});


async function handleWebHookEvent(session) {
    try {
        console.log(`✅ Webhook received: Payment status - ${session.payment_status}`);

        if (session.payment_status !== 'paid') {
            console.log(`⚠️ Payment not successful. Status: ${session.payment_status}`);
            return;
        }

        const cartId = session.metadata.cartId;
        const cart = await cartModel.findById(cartId);
        const user = await userModel.findOne({ email: session.customer_email });
        const product = await productModel.findById(session.metadata.productId);

        // Validate required data
        if (!product && (!cart || !user)) {
            console.error(`❌ Cart or user not found. Cart ID: ${cartId}`);
            return;
        }

        // Extract cart items (if any)
        const cartItems = cart?.cartItems?.length > 0 ? cart.cartItems : [];

        // Create and save the order
        const order = new orderModel({
            userId: user._id,
            cartItems,
            productId: product?._id || null,
            totalOrderPrice: session.amount_total / 100,
            shippingAddress: JSON.parse(session.metadata.shippingAddress),
            serviceType: session.metadata.serviceType,
            paymentMethod: 'visa',
            isPaid: true,
            paymentIntentId: session.payment_intent,
            orderedAt: Date.now(),
        });

        await order.save();

        // If cart had items, update stock and delete cart
        if (cartItems.length > 0) {
            console.log(`🛒 Updating product stock and sold quantities for cart: ${cartId}`);

            const updateOperations = cartItems.map(item => ({
                updateOne: {
                    filter: { _id: item.product },
                    update: { $inc: { stock: -item.quantity, sold: item.quantity } },
                },
            }));

            await productModel.bulkWrite(updateOperations);
            await cartModel.findByIdAndDelete(cartId);

            console.log(`🛒 Cart ${cartId} deleted successfully.`);
        }

    } catch (error) {
        console.error(`❌ Error processing webhook event: ${error.message}`);
        throw error;
    }
}
export const createStripeRefund = handleAsyncError(async (req, res, next) => {
    const { paymentIntentId, amount } = req.body;

    if (!paymentIntentId) {
        return next(new AppError('Payment Intent ID is required', 400));
    }

    try {
        const refund = await stripe.refunds.create({
            payment_intent: paymentIntentId,
            amount: amount * 100,
        });

        res.status(200).json({
            status: 'success',
            message: 'Refund processed successfully',
            refund,
        });
    } catch (error) {
        console.error(`❌ Stripe refund error: ${error.message}`);
        next(new AppError('Refund failed', 500));
    }
});

export const CheckoutWithTap = handleAsyncError(async (req, res) => {
    const { cartId } = req.params;
    const { serviceType, shippingAddress, source } = req.body;
    const { paymentMethod } = req.body;
    if (!cartId || !serviceType || !shippingAddress) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    const cart = await cartModel.findById(cartId).populate("cartItems");
    if (!cart) return res.status(404).json({ error: 'Cart not found' });
    const user = await userModel.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const totalPrice = cart.totalPriceAfterDiscount || cart.totalPrice;
    const newOrder = await orderModel.create({
        userId: req.user.id,
        cartId,
        totalPrice,
        shippingAddress,
        serviceType,
        orderStatus: 'orderd',
        paymentMethod: 'visa'
    });
    const sourceMap = {
        apple_pay: 'src_apple_pay',
        google_pay: 'src_google_pay',
        samsung_pay: 'src_samsung_pay',  // m4 4a8ala samsung
        card: 'src_card',
        mada: 'src_sa.mada',
        tappy: 'src_tappy', // m4 4a8ala tappy
        stc: "src_sa.stcpay"
    };

    const sourceId = sourceMap[paymentMethod];
    if (!sourceId) {
        return res.status(400).json({ message: 'Invalid payment method' });
    }
    console.log("test before redirection");

    try {
        const response = await axios.post(
            'https://api.tap.company/v2/charges',
            {
                amount: newOrder.totalPrice,
                currency: 'SAR',
                threeDSecure: true,
                save_card: false,
                description: `Order ID ${newOrder._id}`,
                customer: {
                    first_name: user.name,
                    email: user.email,
                    phone: {
                        country_code: '966',
                        number: 557877988 || '0000000000'
                    }
                },
                source: {
                    id: sourceId,
                    phone: {
                        country_code: "966",
                        number: "557877988",
                    }
                },
                post: {
                    url: `${process.env.BACKEND_URL}/orders/webhook/tap`
                },
                redirect: {
                    url: `${process.env.FRONTEND_URL}/#/payment-verify`
                },
                metadata: {
                    orderId: newOrder._id.toString(),
                    userId: req.user.id
                }
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.TAP_SECRET_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );


        console.log("test after redirection");
        //   console.log("response from tap", response.data);
        newOrder.paymentIntentId = response.data.id;
        await newOrder.save();
        return res.status(201).json({
            message: 'Payment session created',
            paymentUrl: response.data.transaction.url
        });

    } catch (error) {
        console.error("Tap API error:", error.response?.data || error.message);
        return res.status(400).json({
            error: "Tap payment initialization failed",
            details: error.response?.data || error.message
        });
    }
});

export const handleTapWebhook = handleAsyncError(async (req, res) => {
    const event = req.body;
    const orderId = event.metadata.orderId;
    if (!orderId) {
        return res.status(400).json({ message: 'Missing orderId in metadata' });
    }
    console.log("event from tap", event);

    const order = await orderModel.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (event.status === 'CAPTURED') {
        await orderModel.findByIdAndUpdate({ _id: orderId }, { orderStatus: "processing" });
        let accessToken;
        try {
            const tokenResponse = await axios.post(`${process.env.OTO_URL}/rest/v2/refreshToken`, {
                refresh_token: process.env.OTO_API_TOKEN
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            accessToken = tokenResponse.data.access_token;
            if (accessToken) {
                const populatedOrder = await orderModel.findById(orderId)
                    .populate('cartId.cartItems')
                    .populate('userId');
                if (!populatedOrder) {
                    console.log("Error: Order not found after population");
                    return;
                }
                let cartData = await cartModel
                    .findById(populatedOrder.cartId)
                    .populate({
                        path: 'cartItems.product',
                        model: 'product',
                        select: '_id name price sku stock image' // Include fields needed for OTO
                    })
                    .populate({
                        path: 'user',
                        model: 'user',
                        select: 'name email phone'
                    });

                const productItems = cartData.cartItems.map(item => ({
                    price: item.product.price || item.price, // Fallback to cart item price
                    quantity: item.quantity,
                    sku: item.product.sku || item.product._id.toString(),
                    name: item.product.name || 'Unknown Product',
                }));
                console.log(...productItems, ' this is from the product items ');

                const otoOrderData = {
                    orderId: populatedOrder._id,
                    deliveryOptionId: "564",
                    payment_method: populatedOrder.paymentMethod,
                    amount: populatedOrder.totalPrice,
                    amount_due: populatedOrder.totalPrice,
                    currency: "SAR",
                    customsCurrency: "SAR",
                    orderDate: format(new Date(), 'dd/MM/yyyy'),
                    senderName: "Tires",
                    customer: {
                        name: populatedOrder.userId.name,
                        email: populatedOrder.userId.email,
                        mobile: populatedOrder.userId.phone,
                        address: populatedOrder.shippingAddress.street,
                        district: populatedOrder.shippingAddress.street,
                        city: populatedOrder.shippingAddress.city,
                        country: populatedOrder.shippingAddress.country,
                        postcode: populatedOrder.shippingAddress.postalCode,
                    },
                    items: [
                        ...productItems
                    ]
                };

                console.log("oto order data", otoOrderData);


                try {
                    // Create order in OTO

                    const response = await axios.post(`${process.env.OTO_URL}/rest/v2/createOrder`,
                        otoOrderData,
                        {
                            headers: {
                                Authorization: `Bearer ${accessToken}`,
                                'Content-Type': 'application/json'
                            }
                        }
                    );

                    const deletedCart = await cartModel.findByIdAndDelete(populatedOrder.cartId);
                    console.log("Order created successfully in OTO:", response.data, deletedCart);
                } catch (error) {
                    console.error("error in creating order in OTO", error);
                }

            }
        } catch (error) {
            console.log("error in creating order ", error);
            // Continue with webhook processing even if OTO creation fails
        }
    } else if (event.status === 'DECLINED') {
        console.log("payment failed");
    }

    return res.status(200).json({ message: 'Webhook processed with other status' });
});


export const getOrderById = handleAsyncError(async (req, res, next) => {
    let { orderId } = req.params
    let { id } = req.user
    if (req.user.role == "User") {
        let orderData = await orderModel.findOne({ userId: id, _id: orderId }).populate('productId');
        if (!orderData) return next(new AppError("Order not found", 404));
        return res.status(200).json({ message: "Success", orderData });
    } else if (req.user.role == "Admin") {
        let orderData = await orderModel.findOne({ _id: orderId }).populate('productId');
        if (!orderData) return next(new AppError("Order not found", 404));
        return res.status(200).json({ message: "Success", orderData });
    } else {
        return res.status(400).json({ error: "Invalid role" });
    }
})



export const createTapRefund = handleAsyncError(async (req, res, next) => {
    const { chargeId, amount } = req.body;

    if (!chargeId) {
        return next(new AppError('Charge ID is required', 400));
    }

    try {
        const response = await axios.post(
            `https://api.tap.company/v2/refunds`,
            {
                charge_id: chargeId,
                amount: amount * 100,
                currency: 'EGP',
                reason: 'requested_by_customer',
                metadata: {
                    refund_initiated_by: req.user.id,
                    refund_reason: req.body.reason || 'Not specified'
                }
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.TAP_SECRET_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (response.data.status === 'REFUNDED') {
            const order = await orderModel.findOneAndUpdate(
                { paymentIntentId: chargeId },
                { $set: { isRefunded: true, refundDetails: response.data } },
                { new: true }
            );
        }

        res.status(200).json({
            status: 'success',
            message: 'Refund processed successfully',
            refund: response.data
        });
    } catch (error) {
        console.error(`❌ Tap refund error: ${error.response?.data || error.message}`);
        next(new AppError(error.response?.data?.description || 'Refund failed', 500));
    }
});

export {
    createCashOrder,
    getAllOrders,
    getUserOrders,
    createCheckOutSession,
    createOnlineOrder
};