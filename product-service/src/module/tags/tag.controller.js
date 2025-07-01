import { Router } from 'express';
import { auth } from '../../utilts/midlleware/auth.js';
import { checkRole } from '../../utilts/midlleware/role.js';
import { validation } from '../../utilts/validation.js';
import { createTagSchema, updateTagSchema, getTagSchema } from './tag.validation.js';
import {
    createTag,
    getAllTags,
    getTag,
    updateTag,
    deleteTag
} from './tag.service.js';

const router = Router();

router.post(
    '/add-tag',
    auth,
    checkRole("Admin"),
    validation(createTagSchema),
    createTag
);


router.get('/get-all-tags',  getAllTags);

router.get(
    '/:id',
    validation({ params: getTagSchema }),
    getTag
);

router.patch(
    '/:id',
    auth,
    checkRole("Admin"),
    validation(updateTagSchema),
    updateTag
);

router.delete(
    '/:id',
    auth,
    checkRole("Admin"),
    validation(getTagSchema),
    deleteTag
);




export default router;