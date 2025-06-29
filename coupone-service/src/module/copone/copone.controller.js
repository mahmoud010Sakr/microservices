import { Router } from 'express';
import { auth } from '../../utilts/midlleware/auth.js';
import { createCopone, deleteCopone, getAllCopones, restoreCopone } from './copone.service.js';
import { checkRole } from '../../utilts/midlleware/role.js';
import { createCoponeSchema } from './copone.validation.js';
import { validation } from '../../utilts/validation.js';

const router = Router();

router.post('/create-copone', auth, checkRole('Admin'), validation({ body: createCoponeSchema }), createCopone);

router.get('/get-all-copones', auth, checkRole('Admin'), getAllCopones);

router.delete('/delete-copone/:coponeId', auth, checkRole('Admin'), deleteCopone);

router.patch('/restore-copone/:coponeId', auth, checkRole('Admin'), restoreCopone);

export default router;