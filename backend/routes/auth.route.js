import express from 'express';
import { getUser, loginController, logoutController, signupController } from '../controllers/auth.controller.js';
import { protectedRoute } from '../middlewares/protectedRoute.js';

const router = express.Router();

router.get ('/me',protectedRoute,getUser)

router.post ('/sign-up',signupController)
router.post ('/login',loginController)
router.post ('/logout',logoutController)

export default router;