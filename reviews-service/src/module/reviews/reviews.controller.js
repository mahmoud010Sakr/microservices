import { Router } from 'express';
import { auth } from '../../utilts/midlleware/auth.js';
import { addReview, addReviewOnMc, adminDeleteReview, deleteReview, getAllReviews, getAllReviewsForAdmin, getAllReviewsMCForAdmin, updateReview } from './review.service.js';
import { checkRole } from '../../utilts/midlleware/role.js'
import { validation } from '../../utilts/validation.js';
import { reviewSchema } from './reviews.validation.js';
const router = Router();

router.get('/get-all-reviews/:productId', auth, getAllReviews)
router.get('/get-all-reviews/:productId/admin', auth, checkRole("Admin"), getAllReviewsForAdmin)
router.post('/add-review-on-product/:produtId', auth, validation({ body: reviewSchema.addedReview }), addReview)

router.get('/get-all-reviews-mc/:MCId', auth, checkRole("Admin"), getAllReviewsMCForAdmin)

router.post('/add-review-on-MC/:MCId', auth,  addReviewOnMc)

router.patch('/update-review/:reviewId', auth, validation({ body: reviewSchema.updateReview }), updateReview);
router.delete('/delete-review/:reviewId', auth, deleteReview);
router.delete('/admin-delete-review', auth, checkRole("Admin"), adminDeleteReview)
export default router