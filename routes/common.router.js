import express from 'express';
import BlogController from '../controllers/blog.controller.js';
import UserController from '../controllers/user.controller.js';
import upload from '../middlewares/fileupload.middleware.js';

const router = express.Router();

// view routes
router.get('/login', UserController.auth, UserController.renderLoginView);
router.get('/register', UserController.auth, UserController.renderRegisterView);
router.get('/blogs', UserController.auth, BlogController.renderBlogsView);
router.get('/createblog', UserController.auth, BlogController.renderCreateBlogView);
router.get('/blog/:id', UserController.auth, BlogController.renderReadBlogView);
router.get('/user/:userid', UserController.auth, UserController.renderMyProfileView);
router.get('/createblog/:blogid', 
    UserController.auth, 
    BlogController.renderCreateBlogView
);


// api routes
router.post('/blog', 
    UserController.auth, 
    upload.single('thumbnail'), 
    BlogController.createBlog
);

router.post('/profile',
    UserController.auth,
    upload.single('profile'),
    UserController.updateProfile
);
router.post('/comment', UserController.auth, BlogController.postComment);
router.post('/login', UserController.auth, UserController.login);
router.post('/register', UserController.auth, UserController.register);
router.post('/logout', UserController.logout);


router.delete('/blog', 
    UserController.auth, 
    BlogController.deleteBlog
);


export default router;

