import express from 'express';
import * as userController from '../controller/userController.js';
import * as authController from '../controller/authController.js';

const router = express.Router();

router.post('/signup', authController.createUser);
router.post('/login', authController.login);

// Recebe apenas o email.
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router.patch('/updateMyPassword', authController.protectAccess, authController.updatePassword);

router.patch('/updateMe', authController.protectAccess, userController.updateMe);

router
   .route('/')
   .get(userController.getAllUsers)
   .post(userController.createNewUser);

router
   .route('/:id')
   .get(userController.getUserByUrlId)
   .patch(userController.updateUser)
   .delete(userController.deleteUser);

export { router };