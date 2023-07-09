const Tour = require('./../models/tourmodel')
const catchAsync = require('./../utils/catchAsync')
const AppError = require('./../utils/appError')
const Factory = require('./factoryHandler')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Booking = require('../models/bookingModel')

exports.getCheckoutSessions = catchAsync(async (req,res,next)=>{
    //1) Get Current Booked Tour
    const tour = await Tour.findById(req.params.tourId)
    const user = req.user
    const price = tour.price
    //2) Create Checkout Session
    const session = await stripe.checkout.sessions.create({
        mode:'payment',
        success_url:`${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.user.id}$price=${tour.price}`,
        cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
        customer_email: req.user.email,
        client_reference_id:req.params.tourId,
        line_items: [
            {
            price_data: {
                currency: 'usd',
                unit_amount: tour.price*100,
                product_data: {
                name: `${tour.name} Tour`,
                },
            },
            quantity: 1,
            },
        ],
    })
    // const {user,price} = req.query
    // if(!tour && !user && !price) return next()
    await Booking.create({tour,user,price})
    //3) Create session as a response to User
    res.status(200).json({
        statue:'success',
        session
    })
})

exports.createBookingCheckout = catchAsync(async(req,res,next)=>{
    //This is unsecure Url
    const {tour,user,price} = req.query
    if(!tour && !user && !price) return next()
    await Booking.create({tour,user,price})
    // await Book.save()
    //Get Home page from success Url
    res.redirect(req.originalUrl.split('?')[0])
})

exports.createBooking = Factory.createOne(Booking)
exports.getOneBooking = Factory.getOne(Booking)
exports.getAllBooking = Factory.getAll(Booking)
exports.updateBooking = Factory.updateOne(Booking)
exports.deleteBooking = Factory.deleteOne(Booking)