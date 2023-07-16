const express = require('express') ;
const app = express()
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const tourRouter = require('./routes/tourRoutes')
const userRouter = require('./routes/userRoutes')
const reviewRouter = require('./routes/reviewRoutes')
const bookingRouter = require('./routes/bookingRoutes')
const compression = require('compression')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const XSS = require('xss-clean')
const hpp = require('hpp')
const AppError = require('./utils/appError')
const globalErrorHandler = require('./controllers/errorController')

//1) Global MiddleWares

// Set security http header
app.use(helmet())  //put Helmet in the first of middlewares to protect whole middlewares

// Development logging
if (process.env.NODE_ENV==='development'){
    app.use(morgan('dev'))
}

//limit many requests from same IP to prevent brute force attack
const limiter = rateLimit({
    max:100,
    windowMs : 60*60*1000,
    message : 'too many requests from this IP,please try again later'
})
app.use('/api',limiter)

//body parser, reading data from into req.body
app.use(express.json({limit:'10kb'}))

//Data sanitization against NoSQL query injection
app.use(mongoSanitize())

//Data santization against XSS(agains HTML code)
app.use(XSS())

//prevent parameter pollution
app.use(hpp({
    whitelist:['duration','ratingsAverage','ratingsQuantity','maxGroupSize','difficulty','price']
}))

app.use(compression())

app.get('/',(req,res)=>{
    res.status(200).json({
        "message": "hello everyone❤️",
        "app": "natours",
        "author": "Nowihy"
    })
})

app.use((req,res,next)=>{
    req.requestTime = new Date().toISOString() ;
    next() ;
})

//All Routes
app.use('/api/v1/tours',tourRouter)
app.use('/api/v1/users',userRouter)
app.use('/api/v1/reviews',reviewRouter)
app.use('/api/v1/bookings',bookingRouter)

app.all('*',(req,res,next)=>{
    next(new AppError(`Can not find ${req.originalUrl} on this server !`, 404 ))
})

app.use(globalErrorHandler)

module.exports = app