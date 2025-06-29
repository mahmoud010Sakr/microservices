import { Router } from 'express';
import { addToWishList, deleteFromWishList, getAllWishList } from './wishlist.service.js';
import { auth } from '../../utilts/midlleware/auth.js';

const router = Router();

router.patch("/", auth, addToWishList);
router.delete("/:productId", auth, deleteFromWishList);
router.get("/", auth, getAllWishList);

export default router;