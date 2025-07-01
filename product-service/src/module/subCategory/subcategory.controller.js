import { Router } from 'express';
import { auth } from '../../utilts/midlleware/auth.js';
import { checkRole } from '../../utilts/midlleware/role.js';
import { upload, uploadToCloudinary } from '../../utilts/multer.js';
import { createSubCategory, deleteSubCategory, getAdminSubCategories, getAllDeletedSubCategories, getAllSubCategories, getSubCategoryById, restoreSubCategory, updateSubCategory } from './subcategory.service.js';
import { createSubCategorySchema, deleteSubCategorySchema, getSubCategorySchema, restoreSubCategorySchema, updateSubCategorySchema } from './subcategory.validation.js';
import { validation } from '../../utilts/validation.js';
const router = Router(
    {
        mergeParams: true,
        strict: true
    }
);

router.post('/create-subcategory', auth, checkRole('Admin', 'Agent'), upload.single('image'), uploadToCloudinary(true, "single"), validation({ body: createSubCategorySchema }), createSubCategory);


router.get('/get-all-subcategories', auth, checkRole('Admin', 'Agent'), validation(getSubCategorySchema), getAllSubCategories);


router.get('/get-all-admin-subcategories', auth, checkRole('Admin'), validation(getSubCategorySchema), getAdminSubCategories);


router.get('/get-all-deleted-subcategories', auth, checkRole('Admin'), validation(getSubCategorySchema), getAllDeletedSubCategories);

router.patch('/restore-subcategory/:subCategoryId', auth, checkRole('Admin'), validation(restoreSubCategorySchema), restoreSubCategory);


router.patch('/update-subcategory/:subCategoryId', auth, checkRole('Admin'), upload.single('image'), uploadToCloudinary(false), validation({ body: updateSubCategorySchema, params: restoreSubCategorySchema }), updateSubCategory);

router.delete('/delete-subcategory/:subCategoryId', auth, checkRole('Admin'), validation(deleteSubCategorySchema), deleteSubCategory);



router.get('/get-subcategory-by-id/:subCategoryId', auth, validation(getSubCategorySchema), getSubCategoryById);
export default router;
