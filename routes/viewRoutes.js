import express from 'express';
import * as viewController from '../controller/viewController.js';

const router = express.Router();

router.get('/', viewController.getOverview);
router.get('/tours/:slug', viewController.getTour)

export { router }