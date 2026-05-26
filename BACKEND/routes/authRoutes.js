import express from 'express';
import { login, signup, getAllUsers, getProfile, updateProfilePic, followUser, getUserById, getFollowers, getFollowing, getChattedUsers } from '../controllers/authController.js';
import upload from '../middleware/upload.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/users', getAllUsers);
router.get('/profile', auth, getProfile);
router.put('/profile-pic', auth, upload.single('image'), updateProfilePic);
router.post('/users/:id/follow', auth, followUser);
router.get('/users/:id', auth, getUserById);
router.get('/users/:id/followers', auth, getFollowers);
router.get('/users/:id/following', auth, getFollowing);
router.get('/chatted-users', auth, getChattedUsers);

export default router;