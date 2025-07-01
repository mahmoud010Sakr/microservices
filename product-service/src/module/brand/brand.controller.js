import { Router } from 'express';
import { createBrand, getAllBrands, getBrandById, getAllAdminBrands, getAllDeletedBrands, restoreBrand, updateBrand, deleteBrand, hardDeleteBrand } from './brand.service.js';
import { createBrandSchema, getBrandByIdSchema, updateBrandSchema, deleteBrandSchema, restoreBrandSchema } from './brand.validation.js';
import { validation } from '../../utilts/validation.js';
import { upload, uploadToCloudinary } from '../../utilts/multer.js';
import { checkRole } from '../../utilts/midlleware/role.js';
import { auth } from '../../utilts/midlleware/auth.js';

const router = Router();


router.post('/create-brand', auth, checkRole('Admin', 'Agent'), upload.single('image'), uploadToCloudinary(true, "single"), validation({ body: createBrandSchema, config: { applyNameTransform: true } }), createBrand);

router.get('/get-all-brands', getAllBrands);

router.get('/get-brand-by-id/:brandId',validation({ params: getBrandByIdSchema }), getBrandById);

router.get('/get-all-admin-brands', auth, checkRole('Admin'), getAllAdminBrands);

router.get('/get-all-deleted-brands', auth, checkRole('Admin'), getAllDeletedBrands);

router.patch('/restore-brand/:brandId', auth, checkRole('Admin'), validation({ params: restoreBrandSchema }), restoreBrand);

router.patch('/update-brand/:brandId', auth, checkRole('Admin'), upload.single('logo'), uploadToCloudinary(false , "single"), validation({ body: updateBrandSchema, params: getBrandByIdSchema , config: { applyNameTransform: true } }), updateBrand);

router.delete('/delete-brand/:brandId', auth, checkRole('Admin'), validation({ params: deleteBrandSchema }), deleteBrand);

router.delete('/hard-delete-brand/:brandId', auth, checkRole('Admin'), validation({ params: deleteBrandSchema }), hardDeleteBrand);


export default router;