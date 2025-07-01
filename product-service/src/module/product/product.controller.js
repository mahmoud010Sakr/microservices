import { Router } from "express";
import { uploadToCloudinary, upload } from "../../utilts/multer.js";
import { validation } from "../../utilts/validation.js";
import { checkRole } from "../../utilts/midlleware/role.js";
import { auth } from "../../utilts/midlleware/auth.js";
import {
  addTagSchema,
  createProductSchema,
  deleteProductSchema,
  fileSchema,
  getProductByIdSchema,
  getProductsByIdsSchema,
  restoreProductSchema,
  updateProductSchema,
  addBrandToProductSchema,
} from "./product.validation.js";
import {
  createProduct,
  getAllProducts,
  getProductById,
  getAllAdminProducts,
  getAllDeletedProducts,
  updateProduct,
  deleteProduct,
  restoreProduct,
  getAllProductsByBrandId,
  getAllProductsBySlug,
  getAllProductByType,
  getAllTires,
  getProductsByIds,
  addBrandToProduct,
  displayHeightPackagesProducts,
  filterData,
  deleteMoreThanOneProduct,
  restoreMoreThanOneProduct,
} from "./product.service.js";
import { reviewModel } from '../../database/model/reviews.model.js'
import subCategoryModel from '../../database/model/subcategory.mode.js'
import categoriesModel from "../../database/model/category.model.js";

const router = Router({
  mergeParams: true,
  strict: true,
});

router.post('/add-product', auth, checkRole('Admin', 'Agent'), upload.fields([
  { name: "imageCover", maxCount: 1 },
  { name: "images", maxCount: 10 },
]), uploadToCloudinary(true, "array"), validation(createProductSchema), createProduct);

router.post(
  "/:productId/add-brand",
  auth,
  checkRole("Admin", "Agent"),
  validation(addBrandToProductSchema),
  addBrandToProduct
);

router.get("/get-all-products", getAllProducts);

router.get(
  "/get-product-by-id/:productId",
  validation(getProductByIdSchema),
  getProductById
);

router.get(
  "/get-all-admin-products",
  auth,
  checkRole("Admin"),
  getAllAdminProducts
);


router.post('/add-product', auth, checkRole("Admin"), upload.fields([
  { name: "imageCover", maxCount: 1 },
  { name: "images", maxCount: 10 },
]), uploadToCloudinary(true, "array"), validation(createProductSchema), createProduct);

router.get(
  "/get-all-deleted-products",
  auth,
  checkRole("Admin"),
  getAllDeletedProducts
);
router.post(
  "/update-product/:productId",
  auth,
  checkRole("Admin"),
  upload.fields([
    { name: "imageCover", maxCount: 1 },
    { name: "images", maxCount: 10 },
  ]),
  uploadToCloudinary(false),
  validation(updateProductSchema),
  updateProduct
);
router.delete(
  "/delete-product/:productId",
  auth,
  checkRole("Admin"),
  validation({ params: deleteProductSchema }),
  deleteProduct
);
router.patch(
  "/restore-product/:productId",
  auth,
  checkRole("Admin"),
  validation(restoreProductSchema),
  restoreProduct
);
router.get(
  "/get-all-products-by-brandId/:brandId",
  getAllProductsByBrandId
);
router.get(
  "/get-all-products-by-slug/:slug",
  getAllProductsBySlug
)
router.get('/get-all-product-by-type', getAllProductByType)
router.post('/compare-by-ids',
  validation({ body: getProductsByIdsSchema }),
  getProductsByIds
);
router.get("/tires", getAllTires);
router.get('/filter-data', filterData);
router.get('/display-height-packages-products', displayHeightPackagesProducts);
router.patch('/delete-more-than-product', auth, checkRole('Admin'), deleteMoreThanOneProduct);
router.patch('/restore-more-than-product', auth, checkRole('Admin'), restoreMoreThanOneProduct);
export default router;
