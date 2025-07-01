import { Router } from "express";
import { auth } from "../../utilts/midlleware/auth.js";
import { checkRole } from "../../utilts/midlleware/role.js";
import { validation } from "../../utilts/validation.js";
import {
    createAgentProductSchema,
    updateAgentProductSchema,
    getAgentProductSchema,
    addTagsSchema
} from "./agenProd.validation.js";
import {
    createAgentProduct,
    updateAgentProduct,
    getAgentProduct,
    getAgentProducts,
    deleteAgentProduct,
    getProductDetails,
    addTags,
    displayAllProducts,
    getProductById,
    getAgentByIdForAdmin,
    getAllAgents,
    hardDeleteAgentProduct,
    getAgentProductBySlug,
    removeBrandFromAgentProduct,
    addBrandToAgentProduct
} from "./agentProd.service.js";
import categoriesModel from "../../database/model/category.model.js";
import subCategoryModel from "../../database/model/subcategory.mode.js";

const router = Router();

router.post(
    "/add-agen-product",
    auth,
    
    checkRole("Agent", "Admin"),
    validation(createAgentProductSchema),
    createAgentProduct
);

router.patch(
    "/update-agent-product/:id",
    auth,
    checkRole("Agent", "Admin"),
    validation(updateAgentProductSchema),
    updateAgentProduct
);

router.get(
    "/get-agent-specific-product/:id",
    auth,
    checkRole("Agent", "Admin"),
    validation(getAgentProductSchema),
    getAgentProduct
);

router.get(
    "/get-agent-products",
    auth,
    checkRole("Agent", "Admin"),
    getAgentProducts
);

router.patch(
    '/add-tags/:agentProductId',
    auth,
    checkRole('Agent', 'Admin'),
    validation(addTagsSchema),
    addTags
);
router.delete(
    '/delete-agent-specific-product/:id',
    auth,
    checkRole('Agent', 'Admin'),
    deleteAgentProduct
);
router.get(
    "/get-agent-products/:id",
    getProductDetails
);
router.get(
    "/get-all-products",
    displayAllProducts
);
router.get(
    "/product/:id",
    getProductById
);
router.get('/agent-by-id/:id', auth, checkRole('Admin'), getAgentByIdForAdmin);

router.get('/get-all-admin-agent', auth, checkRole('Admin'), getAllAgents);
router.delete(
    '/hard-delete-agent/:id',
    auth,
    checkRole('Admin'),
    hardDeleteAgentProduct
);
router.get(
    '/get-agent-product-by-slug/:id/:slug',
    getAgentProductBySlug
)


router.patch(
    '/add-brand-to-agent-product/:id', 
    auth,
    checkRole('Admin' , 'Agent'),addBrandToAgentProduct)
router.delete(
    '/remove-brand-from-agent-product/:id',
    auth,
    checkRole('Admin' , 'Agent'),
    removeBrandFromAgentProduct
)
export default router;
