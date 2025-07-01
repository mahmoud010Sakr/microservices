import { Router } from 'express';
import categoriesModel from '../../database/model/category.model.js';
import { uploadToCloudinary, upload } from '../../utilts/multer.js';
import { validation } from '../../utilts/validation.js';
import { checkRole } from '../../utilts/midlleware/role.js'
import { auth } from '../../utilts/midlleware/auth.js';
import { createCategorySchema, deleteCategorySchema, getCategoryByIdSchema, restoreCategorySchema, updateCategorySchema } from './category.validation.js';
import { createCategory, deleteCategory, getAllAdminCategories, getAllCategories, getAllDeletedCategories, getCategoryById, restoreCategory, updateCategory } from './category.service.js'
const router = Router(
    {
        mergeParams: true,
        strict: true
    }
);

router.post('/create-category', auth, checkRole('Admin', 'Agent'), upload.single('image'), uploadToCloudinary(true, "single"), validation({ body: createCategorySchema }), createCategory);
router.get('/get-all-categories', auth, getAllCategories);
router.get('/get-category-by-id/:categoryId', auth, validation({ params: getCategoryByIdSchema }), getCategoryById);
router.get('/get-all-admin-categories', auth, checkRole('Admin'), getAllAdminCategories);
router.get('/get-all-deleted-categories', auth, checkRole('Admin'), getAllDeletedCategories);
router.patch('/restore-category/:categoryId', auth, checkRole('Admin'), validation({ params: restoreCategorySchema }), restoreCategory);
router.patch('/update-category/:categoryId', auth, checkRole('Admin'), upload.single('image'), validation(updateCategorySchema), uploadToCloudinary(false), validation(updateCategorySchema), updateCategory);
router.delete('/delete-category/:categoryId', auth, checkRole('Admin'), validation(deleteCategorySchema), deleteCategory);

export default router;