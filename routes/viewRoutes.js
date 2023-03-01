import express from 'express';
import * as viewController from '../controller/viewController.js';

const router = express.Router();

router.get('/', viewController.getOverview);
router.get('/tour/:slug', viewController.getTour)

export { router }