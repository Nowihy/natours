const AppError = require('./../utils/appError')

const handleCastErrorsDB = err=>{
    const message =`Invalid ${err.path} : ${err.value}`
    return new AppError(message,400)
}

const handleDuplicateFieldErrorsDB = err =>{
    const message = `Duplicate field ${err.keyValue.name} please name the other value`
    return new AppError(message,400)
}

const handleValidationErrorsDB = err=>{
    const errors = Object.values(err.errors).map(el=>el.message) ;
    const message = `Invalid input data: ${errors.join('. ')}`
    return new AppError(message,400)
}

const handleJWTError = ()=> 
new AppError('Invalid Token please login again',401)

const handleJWTExpiredError = ()=> 
new AppError('Your Token has expired. please login again',401)

const sendErrorDev = (err,res)=>{
    res.status(err.statusCode).json({
        status : err.status,
        error : err ,
        message : err.message,
        stack : err.stack
    })
}

const sendErrorProd = (err,res) =>{
//operational, trusted error: send message to client    
    if(err.isOperational){
        res.status(err.statusCode).json({
            status : err.status,
            message : err.message
        })
    }
//programming or unknown errors: don’t leak error details     
    else{
        //1)log error
        console.error('ERROR ⚠️', err)
        
        //2)send generic message
        res.status(500).json({
            status:'error',
            message : 'Something went very wrong'
        })
    }
}

module.exports = (err,req,res,next)=>{
    err.statusCode = err.statusCode || 500 ;
    err.status = err.status || 'error' ;

    if(process.env.NODE_ENV==='development'){
        sendErrorDev(err,res)
    }
    else if(process.env.NODE_ENV==='production'){
        let error = {...err} ;

        if(error.name === 'CastError') error = handleCastErrorsDB(error) ;
        if(error.code === 11000) error = handleDuplicateFieldErrorsDB(error) ;
        if(error.name === 'ValidatorError') error = handleValidationErrorsDB(error) ;
        if(error.name === 'JsonWebTokenError') error = handleJWTError() ;
        if(error.name === 'TokenExpiredError') error = handleJWTExpiredError() ;
        sendErrorProd(error,res)
    }
}
