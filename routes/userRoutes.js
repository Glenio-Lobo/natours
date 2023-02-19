import express from 'express';
import * as userController from '../controller/userController.js';
import * as authController from '../controller/authController.js';

const router = express.Router();

router.post('/signup', authController.createUser);
router.post('/login', authController.login);
// Recebe apenas o email.
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);


// Protege todas as rotas a partir desse ponto, middleware roda em sequência.
router.use(authController.protectAccess);

router.patch('/updateMyPassword', authController.updatePassword);
router.patch('/updateMe', userController.updateMe);
router.delete('/deleteMe', userController.deleteMe);

// Só administradores tem acesso as funções que vem depois desse middleware
router.use(authController.restrictTo('admin'));

router
   .route('/')
   .get(userController.getAllUsers)

router.get('/me', 
   userController.getMe, 
   userController.getUser
);

router
   .route('/:id')
   .get(userController.getUser)
   .patch(userController.updateUser)
   .delete(userController.deleteUser);

export { router };