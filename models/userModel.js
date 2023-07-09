const crypto = require('crypto')
const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')

//name email photo password confirm password

const userSchema = mongoose.Schema({
    name:{
        type:String,
        required:[true,'you should put your name'],
    },
    email:{
        type:String,
        required:[true,'please provide your Email'],
        unique: true,
        lowercase:true,
        validate:[validator.isEmail,'please provide a valid Email']
        // match:,
    },
    photo: {
        type:String,
        default:'default.jpg'
    },
    
    role:{
        type:String,
        enum: ['user','guide','lead-guide','admin'],
        default:'user'
    },
    password:{
        type: String,
        required:[true,'please provide a password'],
        minlength:[8],
        select:false
    },
    passwordConfirm:{
        type: String,
        required:[true,'please confirm your password'],
        validate:{
            validator:function(el){
                //only work on create and save not in update
                return el === this.password
            },
            message:'Passwords are not the same !'
        }
    },
    notification:{
        type:Array
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpire:Date,
    active:{
        type:Boolean,
        default:true
    }

})

userSchema.pre('save',async function(next){
    if(!this.isModified('password')) return next() ;
    this.password = await bcrypt.hash(this.password,12)
    this.passwordConfirm = undefined 
    next()
})
userSchema.pre('save',function(next){
    if(!this.isModified('password')||this.isNew) return next() ;
    this.passwordChangedAt = Date.now() - 1000 ;
    next() 
})

userSchema.pre(/^find/,function(next){
    this.find({active:{$ne:false}})
    next()
})

userSchema.methods.correctPassword = async function(candidatePassword,userPassword){
    return await bcrypt.compare(candidatePassword,userPassword)
}

userSchema.methods.changePasswordAfter = function(JWTTimestamp){
    if(this.passwordChangedAt){
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime()/1000,10)
        return JWTTimestamp < changedTimestamp
    }
    //false means password not changed
    return false ;
}
userSchema.methods.createPasswordResetToken = function(){
    const resetToken = crypto.randomBytes(32).toString('hex')
    this.passwordResetToken=crypto.createHash('sha256').update(resetToken).digest('hex')
    this.passwordResetExpire=Date.now() + 5*60*1000
    return resetToken ;
}
const user = mongoose.model('user',userSchema)

module.exports = user