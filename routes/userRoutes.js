import express from 'express';
import * as userController from '../controller/userController.js';
    
const router = express.Router();

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