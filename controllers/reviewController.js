const apiFeatures = require('../utils/apiFeatures')
const Review = require('./../models/reviewModel')
const catchAsync = require('./../utils/catchAsync')
const AppError = require('./../utils/appError')
const Factory = require('./factoryHandler')

exports.setTourAndUserIDs=(req,res,next)=>{
    //allow nested route 
    if(!req.body.user) req.body.user = req.user.id
    if(!req.body.tour) req.body.tour = req.params.tourId
    next()
}

exports.getAllReviews = Factory.getAll(Review)
exports.createReview = Factory.createOne(Review)
exports.deleteReview = Factory.deleteOne(Review)
exports.updateReview = Factory.updateOne(Review)
exports.getOneReview = Factory.getOne(Review)