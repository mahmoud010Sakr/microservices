import { Router } from 'express';
import {
    activateSubscription,
    cancelSubscription,
    getUserSubscriptions,
    getUserSubscriptionsForAdmin,
    // handlePaymentCallback,
    handlePaymentWebhook,
    hardDeleteSubscription,
    subscribeToPackage,
    // updateSubscription
} from './subscription.service.js';
import {createSubscriptionSchema, subscriptionIdSchema} from './subscription.validation.js';
import { validation } from '../../utilts/validation.js';
import { auth } from '../../utilts/midlleware/auth.js';
import { checkRole } from '../../utilts/midlleware/role.js';
const router = Router();

router.post(
    '/subscribe-to-package',
    auth,
    validation({ body: createSubscriptionSchema }),
    subscribeToPackage
);

router.get(
    '/get-user-subscriptions',
    auth,
    getUserSubscriptions
);


router.delete(
    '/cancel-subscription/:subscriptionId',
    auth,
    checkRole('Admin'),
    validation({ params: subscriptionIdSchema }),
    cancelSubscription
);

router.patch(
    '/activate-subscription/:subscriptionId',
    auth,
    checkRole('Admin'),
    validation({ params: subscriptionIdSchema }),
    activateSubscription
);

router.get("/get-agent-subscriptions-for-admin/:agentId",auth, checkRole('Admin'), getUserSubscriptionsForAdmin);
router.delete('/hard-delete-subscription/:subscriptionId',auth, checkRole('Admin'), validation({ params: subscriptionIdSchema }), hardDeleteSubscription);

router.get('/payment/webhook', handlePaymentWebhook);

export default router;