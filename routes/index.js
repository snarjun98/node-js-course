const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController')
const userController = require('../controllers/userController')
const authController= require('../controllers/authController')
const reviewController= require('../controllers/reviewController')

const {catchErrors}=require('../handlers/errorHandlers')
// Do work here
router.get('/',catchErrors(storeController.getStore));

router.get('/stores',catchErrors(storeController.getStore));
router.get('/stores/page/:page',catchErrors(storeController.getStore));


router.get('/stores/:id/edit',catchErrors(storeController.editStore));

router.get('/add',authController.isLoggedIn, storeController.addStore);

router.post('/add',
storeController.upload,
catchErrors(storeController.resize),
catchErrors(storeController.createStore));

router.post('/add/:id',
storeController.upload,
catchErrors(storeController.resize),
catchErrors(storeController.updateStore));

router.get('/stores/:slug',
catchErrors(storeController.getStoreBySlug)
);

router.get('/tags',catchErrors(storeController.getTags));
router.get('/tags/:tag',catchErrors(storeController.getTags));

router.get('/login',userController.loginForm);
router.get('/register',userController.registerForm);
//validate reg data,register user,log them in

router.post('/register',
userController.validateRegister,
userController.register,
authController.login
);

router.get('/logout',authController.logout);

router.post('/login',authController.login);

router.get('/account',authController.isLoggedIn, userController.account);
router.post('/account',catchErrors(userController.updateAccount))

router.post('/account/forgot',catchErrors(authController.forgot));

router.get('/account/reset/:token', catchErrors(authController.reset));

router.post('/account/reset/:token',
authController.confirmedPasswords,
catchErrors(authController.update));

router.get('/api/search',catchErrors(storeController.searchStores));
router.get('/api/stores/near',catchErrors(storeController.mapStores));
router.get('/map',storeController.mapPage);
router.post('/api/stores/:id/heart',catchErrors(storeController.heartStore))
router.get('/hearts',authController.isLoggedIn, catchErrors(storeController.getHearts))
router.post('/reviews/:id',
authController.isLoggedIn,
catchErrors(reviewController.addReview));

router.get('/top',catchErrors(storeController.getTopStores))
module.exports = router;
