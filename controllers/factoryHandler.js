const catchAsync = require('./../utils/catchAsync')
const AppError = require('./../utils/appError')
const apiFeatures = require('../utils/apiFeatures')

exports.deleteOne = Model=>catchAsync( async (req,res,next)=>{
    const doc = await Model.findByIdAndDelete(req.params.id)
    if(!doc){
        return next(new AppError('There is no doc found by this ID',404))
    }
    res.status(204).json({
        statue: 'success',
        data: null
    })  
})

exports.updateOne=Model=>catchAsync( async (req,res,next)=>{
    const doc =await Model.findByIdAndUpdate(req.params.id,req.body,{
        new:true,
        runValidators:true
    })
    if(!doc){
        return next(new AppError('There is no Doc found by this ID',404))
    }
        res.status(200).json({
            statue: 'success',
            data:doc
        })
})

exports.createOne=Model=>catchAsync( async (req,res,next)=>{ 
    const doc = await Model.create(req.body)
    res.status(201).json({
        statue:'success',
        data:{
            data:doc
        }
    })
})

exports.getOne=(Model,popOptions)=>catchAsync( async (req,res,next)=>{
    let query =Model.findById(req.params.id)
    if(popOptions)query=query.populate(popOptions)
    const doc =await query

    if(!doc){
        return next(new AppError('There is no Document found by this ID',404)
        )}
        return res.status(200).json({
            statue:'success',       
            data:{
                data:doc
            }
        })
})

exports.getAll=Model=>catchAsync(async(req,res,next)=>{
    //to allow for nested GET reviews on Tour (Hack)
    let filter = {}
    if(req.params.tourId) filter = {tour:req.params.tourId}
    const features = new apiFeatures(Model.find(filter),req.query)
    .filter()
    .sort()
    .limit()
    .paginate()
    // const doc = await features.query.explain() ;
    const doc = await features.query ;
    
    res.status(200).json({
            statue:'success',
            requestedAt:req.requestTime ,
            results:doc.length,
            data:{
                data:doc
            }
        })
})
