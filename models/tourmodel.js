const mongoose=require('mongoose')
const slugify = require('slugify')
// const User = require('./userModel')
// const validator = require('validator')

const tourSchema = mongoose.Schema({
    //duration-maxGroup-difficulty-ratingsAverage-ratingsQuantity-priceDiscount-summary
    name:{
        type:String,
        required:[true,'A Tour must have a name'],
        unique:true,
        maxlength:[50,'A Tour name maximum charachter 50'],
        minlength:[10,'A Tour name minmum charachter 50'],
        // validate:[validator.isAlpha,'A tour name must only contain characters']
    },
    slug: String,
    duration:{
        type:Number,
        required:[true,'A Tour must have a duration']
    },
    maxGroup:{
        type:Number,
        required:[true,'A tour must have number of maxGroup']
    },
    difficulty:{
        type:String,
        required:[true,'A Tour must have difficulty'],
        enum:{
            values:['easy','medium','difficult'],
            message:'Difficulty shoud be easy,medium or difficult'
        }
    },
    ratingsAverage:{
        type:Number,
        required:[true,'A Tour must have average rating'],
        default:3.0,
        min:[1.0,'A Tour ratingsAverage must be above 1.0'],
        max:[5.0,'A Tour ratingsAverage must be below 5.0'],
        set:val=>Math.round(val*10)/10
    },
    ratingsQuantity:{
        type:Number,
        required:[true,'A Tour must have rating quantity'],
        default:0
    },
    price:{
        type:Number,
        required:[true,'A tour must have a price']
    },
    priceDiscount:{
        type:Number,
        validate:{
            validator:function(val){
                return val < this.validator
            },
            message:'Discount price ({Value}) should be below regular price'
        }
    },
    summary:{
        type:String,
        required:[true,'A tour must have a summary'],
        trim:true
    },
    description:{
        type:String,
        trim:true,
    },
    secretTour:{
        type:Boolean,
        default:false
    },
    imageCover:{
        type:String,
        required:[true,'A tour must have a cover image']
    },
    images:[String],
    createdAt:{
        type:Date,
        default:Date.now(),
        select:false
    },
    startDates:[Date],
    startLocation:{
        type:{
            type: String,
            default:'Point',
            enum:['Point']
        },
        coordinates:[Number],
        address:String,
        description:String
    },
    Locations:[
        {
            type:{
                type:String,
                default:'point',
                enum:['point']
            },
            coordinates:[Number],
            address:String,
            description:String,
            day:Number
        }
    ],
    guides:[{
        type:mongoose.Schema.ObjectId,
        ref:'user'
    }],
    // reviews:[{
    //     type:mongoose.Schema.ObjectId,
    //     ref:'Review'
    // }]
},
{
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
})

tourSchema.index({price:1,ratingsAverage:-1})
tourSchema.index({slug:1})
tourSchema.index({startLocation:'2dsphere'})

tourSchema.virtual('durationWeeks').get(function(){
    return this.duration/7 ;
})

tourSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'tour',
    localField: '_id'
});

//document middleware: runs before .save() , .create()
tourSchema.pre('save',function(next){
    this.slug =slugify(this.name,{lower:true})
    next()
})

// tourSchema.pre('save',async function(next){
//     const guidePromises=this.guides.map(async id=>await User.findById(id)) 
//     this.guides= await Promise.all(guidePromises)
//     next()
// })

//Query MiddleWare : .find()
tourSchema.pre(/^find/,function(next){
    this.find({secretTour:{$ne:true}})
    this.start = Date.now()
    next()
})

tourSchema.pre(/^find/,function(next){
    this.populate({
        path:'guides',
        select:'-__v -passwordChangedAt'
    })
    next()
})

tourSchema.post(/^find/,function(docs,next){
    console.log(`middleware took :${Date.now()-this.start} milliseconds`)
    next()
})

//Aggregation Middleware
// tourSchema.pre('aggregate',function(next){
//     this.pipeline().unshift({$match:{secretTour:{$ne:true}}})
//     // console.log(this.pipeline())
//     next()
// })

const Tour = mongoose.model('Tour',tourSchema)

module.exports=Tour;