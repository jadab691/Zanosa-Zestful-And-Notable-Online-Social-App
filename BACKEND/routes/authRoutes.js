import express from 'express';
import { login, signup, getAllUsers, getProfile, updateProfilePic } from '../controllers/authController.js';
import upload from '../middleware/upload.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/users', getAllUsers);
router.get('/profile', auth, getProfile);
router.put('/profile-pic', auth, upload.single('image'), updateProfilePic);

export default router;