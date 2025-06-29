import { Router } from 'express';
import { auth } from '../../utilts/midlleware/auth.js';
import { checkRole } from '../../utilts/midlleware/role.js';
import {
    deletedUser,
    getAllDeletedUser,
    getAllMentenanceCenter,
    getAllMentenanceCenterForAdmins,
    getMaintenanceByUser,
    getMentennaceByIdForAdmin,
    addMaintenanceCenter,
    updateMaintenanceCenterForAdmin,
    deleteMaintenanceCenter,
    getAllUsers,
    getAllUsersForChat,
    getSpecificUser,
    restoreUser,
    updatePercentage,
    updateProfile,
    restoreMaintenanceCenter,
    updateMaintenanceCenter,
    hardDeleteMC,
    updateUser
} from './user.service.js';
import {
    deleteUserSchema,
    maintenanceCenterSchema,
    updatePercentageSchema,
    updateProfileSchema
} from './user.validation.js';
import { validation } from '../../utilts/validation.js';
import { upload, uploadToCloudinary } from '../../utilts/multer.js';

const router = Router();

// =========================
// User Management
// =========================

router.get('/get-all-deleted-users', auth, checkRole('Admin'), getAllDeletedUser);
router.patch('/update-profile', auth, validation({ body: updateProfileSchema }), updateProfile);
router.delete('/delete-user/:userId', auth, checkRole('Admin'), validation({params:deleteUserSchema}), deletedUser);
router.get('/get-all-users', auth, checkRole('Admin'), getAllUsers);
router.patch('/restore-user/:userId', auth, checkRole('Admin'), validation({params:deleteUserSchema}), restoreUser);
router.patch('/update-user/:userId', auth, checkRole('Admin'), validation({params:deleteUserSchema}), updateUser);
router.patch('/update-percentage/:userId', auth, checkRole('Admin'), validation({params:deleteUserSchema}), updatePercentage);
router.get('/get-specific-user/:userId', auth, checkRole('Admin'), validation({params:deleteUserSchema}), getSpecificUser);

// =========================
// Maintenance Center Management
// =========================

router.get('/get-all-mentenance-center', getAllMentenanceCenter);
router.get('/get-all-maintenance-centers-for-admin', auth, checkRole("Admin"), getAllMentenanceCenterForAdmins);
router.get('/get-maintenance-by-user', auth, getMaintenanceByUser);
router.get('/get-maintenance-by-id-for-admin/:maintenanceId', auth, checkRole("Admin"), getMentennaceByIdForAdmin);
router.post('/add-maintenance-center', auth, checkRole("Admin"), validation(maintenanceCenterSchema), addMaintenanceCenter);
router.patch('/update-maintenance-center/:id', auth, checkRole("Admin"), upload.fields([
    { name: "imageCover", maxCount: 1 },
    { name: "images", maxCount: 1 },
]),
    uploadToCloudinary(false , "array"), validation(maintenanceCenterSchema), updateMaintenanceCenterForAdmin);
router.patch('/update-maintenance-center-for-user', auth, checkRole("MC"), upload.fields([
    { name: "imageCover", maxCount: 1 },
    { name: "images", maxCount: 1 },
]),
    uploadToCloudinary(false), validation(maintenanceCenterSchema), updateMaintenanceCenter);
router.delete('/delete-maintenance-center/:id', auth, checkRole("Admin"), deleteMaintenanceCenter);
router.patch('/restore-maintenance-center/:id', auth, checkRole("Admin"), restoreMaintenanceCenter );
router.patch('/update-percentage/:userId',auth,checkRole('SuperAdmin'),validation(updatePercentageSchema), updatePercentage);
router.get('/get-specific-user/:userId', auth, checkRole('Admin'),  getSpecificUser);
// =========================
// (Optional) Chat/Other Endpoints
// =========================
// router.get('/users/chat', auth, getAllUsersForChat); // Uncomment if needed
router.delete('/maintenance-centers/:id/hard', auth, checkRole('Admin'), hardDeleteMC); 

export default router;