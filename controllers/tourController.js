const apiFeatures = require('../utils/apiFeatures')
const Tour = require('./../models/tourmodel')
const catchAsync = require('./../utils/catchAsync')
const AppError = require('./../utils/appError')
const Factory = require('./factoryHandler')
const multer = require('multer')
const sharp = require('sharp')



const multerStorage = multer.memoryStorage()

//Filter files to allow images only //If I want all files don not use this filter
const multerFilter= (req,file,cb)=>{
    if(file.mimetype.startsWith('image')){
        cb(null,true)
    }else{
        cb(new AppError('It is not an Image, Please upload an image',400),false)
    }
}

const upload = multer({
    storage:multerStorage,
    fileFilter:multerFilter
})

exports.uploadTourPhoto = upload.fields([
    {name:'imageCover',maxCount:1},
    {name:'images',maxCount:3}
])

exports.resizeTourPhoto =catchAsync(async(req,res,next)=>{
    if(!req.files.imageCover||!req.files.images) return next()
    
    //1) Cover Image
    req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`
    await sharp(req.file.imageCover[0].buffer)
    .resize(2000,1333)
    .toFormat('jpeg')
    .jpeg({quality:90})
    .toFile(`public/img/tours/${req.body.imageCover}`)

    //2)Images

    req.body.images = []

    //Using map not foreach to await all three Promises 
    await Promise.all(
    req.files.images.map(catchAsync(async(file,i)=>{
        const filename = `tour-${req.params.id}-${Date.now()}-${i+1}.jpeg`
        await sharp(file.buffer)
        .resize(2000,1333)
        .toFormat('jpeg')
        .jpeg({quality:90})
        .toFile(`public/img/tours/${filename}`)
        req.body.images.push(filename)
    })))
    next()
})

// upload.single('imageCover')
// upload.array('images',3)

exports.aliasTopTours =(req,res,next)=>{
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price' ; 
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty'
    next()
}

exports.getAllTours= Factory.getAll(Tour)
exports.getOneTour = Factory.getOne(Tour,{path:'reviews'})
exports.createTour = Factory.createOne(Tour)
exports.updateTour = Factory.updateOne(Tour)
exports.deleteTour = Factory.deleteOne(Tour)

exports.getTourStats =catchAsync( async (req,res)=>{
        const stats = await Tour.aggregate([
            {
                $match: { ratingsAverage: {$gte:3.1} }
            },
            {
                $group: {
                    _id: {$toUpper:'$difficulty'},
                    numTours: {$sum:1},
                    numRatings:{$sum:'$ratingsQuantity'},
                    avgRating:{$avg:'$ratingsAverage'},
                    avgPrice:{$avg:'$price'},
                    minPrice:{$min:'$price'},
                    maxPrice:{$max:'$price'}
                },
            },
            {
                $sort:{avgRating : 1}
            }
        ])
        res.status(200).json({
            statue:'success',
            data:stats
        })
})

exports.getMonthlyPlan=catchAsync( async (req,res,next)=>{
    const year = req.params.year * 1 ;
    const plan = await Tour.aggregate([
        {
            $unwind:'$startDates'
        },
        {
            $match:{
            startDates:{
            $gte: new Date(`${year}-01-01`)
            // $lte: new Date(`${year}-12-31`)
            }
            }
        },
        {
            $group:{
                _id: {$month:'$startDates'},
                numToursStarts:{$sum:1},
                tours:{$push:'$name'}
            }
        },
        {
            $addFields:{ month: '$_id'} //put value of _id in month
        },
        {
            $project:{ _id : 0 } //hide _id
        },
        {
            $sort:{month:1}  // 1 refer to ascendeng
        },
        {
            $limit:12 
        }
    ])
        res.status(200).json({
            statue:'success',
            number: plan.length,
            data:plan
        })
})

exports.getTourWithin=catchAsync(async(req,res,next)=>{
    const {distance,latlng,unit}=req.params
    const[lat,lng] = latlng.split(',')  
    const radius = unit ==='mi' ? distance/3963.2 : distance/6378.1
    if(!lat||!lng){
        return next(new AppError('please provide latitutr  and longitude in the format'),400)
    }
    const tours = await Tour.find({
        startLocation:{ $geoWithin: { $centerSphere: [[lng,lat],radius] }}
    })
    res.status(200).json({
        statue:'success',
        results:tours.length,
        data:{data:tours}
    })
})

exports.getDistances = catchAsync(async (req, res, next) => {
    const { latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');
    const multiplier = unit === 'mi' ? 0.000621371 : 0.001;
    if (!lat || !lng) {
    next(
        new AppError(
        'Please provide latitude and longitude in the format lat,lng',
        400
        )
    );
    }
    const distances = await Tour.aggregate([
    {
        $geoNear: {
        near: {
            type: 'Point',
            coordinates: [lng * 1, lat * 1],
        },
          distanceField: 'distance', // contains calculated distance
          distanceMultiplier: multiplier, // m--> k.m, m--> mi
        },
    },
    {
        $project: {
        distance: 1,
          name: 1, // only get these fields
        },
    },
    ]);
    res.status(200).json({
    status: 'success',
    data: {
        data: distances,
    },
    });
});