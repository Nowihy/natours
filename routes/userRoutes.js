const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')
const authController = require('../controllers/authController')

router.route('/signup').post(authController.signUp)
router.post('/login',authController.logIn)
router.post('/forgetPassword',authController.forgetPassword)
router.patch('/resetPassword/:token',authController.resetPassword)

//protect all routes after this middleware
router.use(authController.protect)

router.patch('/updateMyPassword',authController.updatePassword)
router.patch('/updateMe',userController.uploadUserPhoto,userController.resizeUserPhoto,userController.updateMe)
router.delete('/deleteMe',userController.deleteMe)
router.get('/me',userController.getMe,userController.getOneUser)

router.use(authController.restrictTO('admin'))

router
.route('/')
.get(userController.getAllUsers)
.post(userController.createUser)
router
.route('/:id')
.get(userController.getOneUser)
.patch(userController.updateUser)
.delete(userController.deleteUser)


module.exports=router