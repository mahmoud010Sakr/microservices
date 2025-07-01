import packageModel from '../../database/model/package.model.js';
import userModel from '../../database/model/user.model.js';
import axios from 'axios';
import subscriptionModel from '../../database/model/subscription.model.js';
import { handleAsyncError } from '../../utilts/errorHandling/handelAsyncError.js';


const validateCardDetails = (card) => {
    if (!card) return null;
    return {
        number: card.number.replace(/\D/g, ''),
        exp_month: card.expMonth,
        exp_year: card.expYear,
        cvc: card.cvc
    };
};

const processTapPayment = async (paymentData) => {
    try {
        const validatedCard = validateCardDetails(paymentData.card);

        const tapPayload = {
            amount: paymentData.amount,
            currency: paymentData.currency || 'SAR',
            customer: {
                first_name: paymentData.customer.first_name,
                email: paymentData.customer.email
            },
            source: {
                id: paymentData.paymentMethod === 'card' ? 'src_card' : paymentData.paymentMethod,
                ...(validatedCard && {
                    card: {
                        ...validatedCard,
                        name: `${paymentData.customer.first_name} ${paymentData.customer.last_name}`,
                        address: { country: 'SA' }
                    }
                })
            },
            redirect: {
                url: `${process.env.NGROKWEBHOOK}/subscription/payment/callback?tap_id=${paymentData.tap_id}&status=${paymentData.status}`
            },
            post: {
                url: `${process.env.NGROKWEBHOOK}/subscription/payment/webhook`
            },
            metadata: {
                userId: paymentData.userId,
                packageId: paymentData.packageId,
                internalReference: `sub_${Date.now()}`
            }
        };


        const response = await axios.post(
            process.env.TAP_API_URL || 'https://api.tap.company/v2/charges',
            tapPayload,
            {
                headers: {
                    'Authorization': `Bearer ${process.env.TAP_SECRET_KEY}`,
                    'Content-Type': 'application/json'
                },
                timeout: 20000
            }
        );

        return {
            success: true,
            transactionId: response.data.id,
            status: response.data.status,
            paymentUrl: response.data.transaction?.url,
            tap_id: response.data.id
        };
    } catch (error) {
        const errorData = error.response?.data || { message: error.message };
        console.error('Tap Payment Error:', JSON.stringify(errorData, null, 2));
        return {
            success: false,
            message: errorData.errors?.[0]?.description || errorData.message || 'Payment failed',
            code: errorData.errors?.[0]?.code || 'payment_error',
            details: errorData
        };
    }
};

export const subscribeToPackage = handleAsyncError(async (req, res) => {
    const { packageId, paymentMethod } = req.body;
    const { id: userId } = req.user;



    const sourceMap = {
        apple_pay: 'src_apple_pay',
        google_pay: 'src_google_pay',
        samsung_pay: 'src_samsung_pay',  // m4 4a8ala samsung
        card: 'src_card',
        mada: 'src_sa.mada',
        tappy: 'src_tappy', // m4 4a8ala tappy
        stc: "src_sa.stcpay"
    }

    const sourceId = sourceMap[paymentMethod];
    if (!sourceId) {
        return res.status(400).json({ message: 'Invalid payment method' });
    }
    if (!packageId || !paymentMethod) {
        return res.status(400).json({
            success: false,
            message: 'Package ID and payment method are required'
        });
    }

    let existingSubscription = await subscriptionModel.findOne({ user: userId, isActive: true });
    if (existingSubscription) {
        return res.status(400).json({
            success: false,
            message: 'You already have an active subscription'
        });
    }

    try {
        const [packageData, user] = await Promise.all([
            packageModel.findById(packageId),
            userModel.findById(userId).select('name email phone')
        ]);

        if (!packageData || !user) {
            return res.status(404).json({
                success: false,
                message: !packageData ? 'Package not found' : 'User not found'
            });
        }

        const nameParts = user.name.split(' ');
        const paymentResult = await processTapPayment({
            amount: packageData.price,
            currency: 'SAR',
            customer: {
                first_name: nameParts[0],
                last_name: nameParts.slice(1).join(' ') || nameParts[0],
                email: user.email
            },
            paymentMethod: sourceId,
            userId: userId.toString(),
            packageId: packageId.toString(),
        });

        if (!paymentResult.success) {
            return res.status(400).json({
                success: false,
                message: paymentResult.message,
                code: paymentResult.code,
                details: paymentResult.details
            });
        }

        return res.json({
            success: true,
            message: 'Payment initiated successfully. Complete payment to activate subscription.',
            payment: {
                transactionId: paymentResult.transactionId,
                paymentUrl: paymentResult.paymentUrl,
                status: paymentResult.status
            }
        });

    } catch (error) {
        console.error('Subscription Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

export const handlePaymentWebhook = handleAsyncError(async (req, res) => {
    try {
        console.log("ana gowa ");

        const webhookData = req.body;
        console.log('Webhook received:', JSON.stringify(webhookData, null, 2));
        const { id: tap_id, status, metadata, amount, currency } = webhookData;

        if (!tap_id || !metadata) {
            return res.status(400).json({
                success: false,
                message: 'Invalid webhook data'
            });
        }

        // Additional verification by fetching charge details from Tap API
        const verification = await axios.get(
            `https://api.tap.company/v2/charges/${tap_id}`,
            {
                headers: {
                    'Authorization': `Bearer ${process.env.TAP_SECRET_KEY}`
                }
            }
        );

        const charge = verification.data;
        console.log('Charge verification:', JSON.stringify(charge, null, 2));

        if (charge.status === 'CAPTURED' && status === 'CAPTURED') {
            // Payment successful - create subscription
            const { userId, packageId } = metadata;

            // Check if subscription already exists for this transaction
            let existingSubscription = await subscriptionModel.findOne({
                'payment.transactionId': tap_id
            });

            if (existingSubscription) {
                console.log('Subscription already exists for this transaction');
                return res.status(200).json({ success: true, message: 'Already processed' });
            }

            // Get package and user data
            const [packageData, user] = await Promise.all([
                packageModel.findById(packageId),
                userModel.findById(userId)
            ]);

            if (!packageData || !user) {
                console.error('Package or user not found:', { packageId, userId });
                return res.status(404).json({
                    success: false,
                    message: 'Package or user not found'
                });
            }

            const subscription = new subscriptionModel({
                user: userId,
                package: packageId,
                startDate: new Date(),
                endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
                payment: {
                    transactionId: tap_id,
                    amount: amount,
                    currency: currency,
                    status: status,
                    method: charge.source?.payment_method || 'card',
                    tap_id: tap_id,
                    paidAt: new Date(),
                    ...(charge.source?.card && {
                        card_last4: charge.source.card.last_four
                    })
                },
                isActive: true,
                status: 'active',
                agent: userId
            });

            await subscription.save();
            await packageModel.findOneAndUpdate(
                { _id: packageId },
                { $push: { agentId: userId } },
                { new: true }
            );

            console.log('Subscription created successfully:', subscription._id);

            // You can add additional logic here like sending confirmation emails

        } else if (status === 'FAILED' || status === 'DECLINED') {
            // Payment failed - log for reference
            console.log('Payment failed for transaction:', tap_id);

            // You might want to create a failed payment record or send notification
        }

        // Always respond with 200 to acknowledge webhook receipt
        res.status(200).json({ success: true, message: 'Webhook processed' });

    } catch (error) {
        console.error('Webhook Error:', error);
        res.status(500).json({
            success: false,
            message: 'Webhook processing failed',
            error: error.message
        });
    }
});

// export const handlePaymentCallback = handleAsyncError(async (req, res) => {
//     const { tap_id, status } = req.query;

//     try {
//         // Verify payment status
//         const verification = await axios.get(
//             `https://api.tap.company/v2/charges/${tap_id}`,
//             {
//                 headers: {
//                     'Authorization': `Bearer ${process.env.TAP_SECRET_KEY}`
//                 }
//             }
//         );

//         console.log("Payment callback verification:", verification.data);

//         const charge = verification.data;

//         // Check if subscription exists (should be created by webhook)
//         const subscription = await subscriptionModel.findOne({
//             'payment.transactionId': tap_id
//         }).populate('package').populate('user');

//         if (charge.status === 'CAPTURED') {
//             if (subscription) {
//                 res.redirect(`${process.env.FRONTEND_URL}/subscription/success?id=${subscription._id}`);
//             } else {
//                 res.redirect(`${process.env.FRONTEND_URL}/subscription/pending?tap_id=${tap_id}`);
//             }
//         } else {
//             res.redirect(`${process.env.FRONTEND_URL}/subscription/failed?tap_id=${tap_id}`);
//         }

//     } catch (error) {
//         console.error('Callback Error:', error);
//         res.redirect(`${process.env.FRONTEND_URL}/subscription/error`);
//     }
// });

export const cancelSubscription = handleAsyncError(async (req, res) => {
    const { subscriptionId } = req.params;
 const checkStatus = await subscriptionModel.findById(subscriptionId);
    if (checkStatus.status === 'cancelled') {
        return res.status(400).json({
            success: false,
            message: 'Subscription already cancelled'
        });
    }
    const subscription = await subscriptionModel.findByIdAndUpdate(
        subscriptionId,
        {
            status: 'cancelled',
            isActive: false,
            cancelledAt: new Date()
        },
        { new: true }
    );

    if (!subscription) {
        return res.status(404).json({
            success: false,
            message: 'Subscription not found'
        });
    }

    // Remove user from package
    await packageModel.findOneAndUpdate(
        { _id: subscription.package },
        { $pull: { agentId: subscription.user } }
    );

    res.json({
        success: true,
        message: 'Subscription cancelled successfully',
        subscription: subscription
    });
});




export const activateSubscription = handleAsyncError(async (req, res) => {
    const { subscriptionId } = req.params;

    const CheckStatus = await subscriptionModel.findById(subscriptionId);
    if (CheckStatus.status === 'active') {
        return res.status(400).json({
            success: false,
            message: 'Subscription already active'
        });
    }

    const subscription = await subscriptionModel.findByIdAndUpdate(
        subscriptionId,
        { isActive: true, status: 'active' },
        { new: true }
    );

    if (!subscription) {
        return res.status(404).json({
            success: false,
            message: 'Subscription not found'
        });
    }

    res.json({
        success: true,
        message: 'Subscription activated successfully',
        subscription: subscription
    });
})


export const getUserSubscriptions = handleAsyncError(async (req, res) => {
    const { id } = req.user;

    const subscriptions = await subscriptionModel.find({ user: id })
        .populate('package')
        .sort({ createdAt: -1 });

    res.json({
        success: true,
        message: 'Subscriptions found successfully',
        subscriptions: subscriptions
    });
});


export const getUserSubscriptionsForAdmin = handleAsyncError(async (req, res) => {
    const { agentId } = req.params;

    const subscriptions = await subscriptionModel.find({ user: agentId })
        .populate('package')
        .sort({ createdAt: -1 });

    res.json({
        success: true,
        message: 'Subscriptions found successfully',
        subscriptions: subscriptions
    });
});



export const getSubscriptionStatus = handleAsyncError(async (req, res) => {
    const { tap_id } = req.params;

    const subscription = await subscriptionModel.findOne({
        'payment.transactionId': tap_id
    }).populate('package').populate('user');

    if (!subscription) {
        return res.status(404).json({
            success: false,
            message: 'Subscription not found'
        });
    }

    res.json({
        success: true,
        message: 'Subscription status retrieved',
        subscription: subscription
    });
});


export  const hardDeleteSubscription = handleAsyncError(async (req, res) => {
    const { subscriptionId } = req.params;
    const subscription = await subscriptionModel.findByIdAndDelete(subscriptionId);
    if (!subscription) {
        return res.status(404).json({
            success: false,
            message: 'Subscription not found'
        });
    }
    res.json({
        success: true,
        message: 'Subscription deleted successfully',
        subscription: subscription
    });
});