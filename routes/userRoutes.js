import express from 'express';
import * as userController from '../controller/userController.js';
import * as authController from '../controller/authController.js';

const router = express.Router();

router.post('/signup', authController.createUser);
router.post('/login', authController.login);

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