const express = require('express')
const router = express.Router({mergeParams:true})
const reviewController = require('./../controllers/reviewController')
const authController = require('./../controllers/authController')

router.use(authController.protect)

router.route('/')
.get(reviewController.getAllReviews)
.post(authController.restrictTO('user'),
reviewController.setTourAndUserIDs,
reviewController.createReview)

router.route('/:id')
.get(reviewController.getOneReview)
.patch(authController.restrictTO('admmin','user'),reviewController.updateReview)
.delete(authController.restrictTO('admin','user'),reviewController.deleteReview)

module.exports= router;
