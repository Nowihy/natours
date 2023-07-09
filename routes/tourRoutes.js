const express = require('express')
const router = express.Router()
const tourController = require('./../controllers/tourController')
const authController = require('./../controllers/authController')
const reviewRouter = require('./reviewRoutes')

//Use Review Router in tourRoute
router.use('/:tourId/reviews',reviewRouter)

// router.param('id',tourController.checkId)
router
.route('/top-5-tours')
.get(tourController.aliasTopTours ,tourController.getAllTours)
router
.route('/tour-stats')
.get(tourController.getTourStats)
router
.route('/monthly-plan/:year')
.get(authController.protect,
    authController.restrictTO('admin','lead-guide','guide'),
    tourController.getMonthlyPlan)
router
.route('/tours-within/:distance/center/:latlng/unit/:unit')
.get(tourController.getTourWithin);
  // /tours-within?distance=400&center=-40,45&unit=mi
  // /tours-within/400/center/-40,45/unit/mi
router
.route('/distances/:latlng/unit/:unit')
.get(tourController.getDistances)
router
.route('/')
.get(tourController.getAllTours)
.post(authController.protect,
    authController.restrictTO('admin','lead-guide'),
    tourController.createTour) 


router
.route('/:id')
.get(tourController.getOneTour)
.patch(authController.protect,
    authController.restrictTO('admin','lead-guide'),
    tourController.uploadTourPhoto,
    tourController.resizeTourPhoto,
    tourController.updateTour)
.delete(authController.protect,
    authController.restrictTO('admin','lead-guide'),
    tourController.deleteTour) 


module.exports=router
