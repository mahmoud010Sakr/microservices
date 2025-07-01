import { Router } from 'express';
import { createPackage,getAllActivatedPackages,diactivatePackage, getAllPackages, hardDeletePackage} from './package.service.js';
import {createPackageSchema, packageIdSchema  } from './package.validation.js'
import { auth } from '../../utilts/midlleware/auth.js'
import { checkRole } from '../../utilts/midlleware/role.js';
import { validation } from '../../utilts/validation.js';

const router = Router();

router.post(
    '/createPackage', 
    auth, 
    checkRole('Admin'), 
    validation({ body: createPackageSchema }),
    createPackage
);

router.get(
    '/active', 
    auth, 
    getAllActivatedPackages
);

router.get(
    '/get-all-packages', 
    auth, 
    checkRole('Admin'),
    getAllPackages
)
router.patch(
    '/:packageId/deactivate', 
    auth, 
    checkRole('Admin'),
    validation({ params: packageIdSchema }),
    diactivatePackage
);

router.delete(
    '/hard-delete-package/:packageId',
    auth,
    checkRole('Admin'),
    validation({ params: packageIdSchema }),
    hardDeletePackage
);
export default router;