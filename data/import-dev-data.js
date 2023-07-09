const mongoose=require('mongoose')
const dotenv = require('dotenv')
dotenv.config({path:'./config.env'})
const Tour = require('./../models/tourmodel')
const User = require('./../models/userModel')
const Review = require('./../models/reviewModel')
const fs = require('fs')

const DB = process.env.DATABASE.replace('<PASSWORD>',process.env.DATABASE_PASSWORD);
mongoose.connect(DB,{
    useNewUrlParser:true,
    useCreateIndex:true,
    useFindAndModify:false
}).then(()=> console.log('successful connection !'))

const tours =JSON.parse(fs.readFileSync(`${__dirname}/tours.json`,'utf-8'))
const reviews =JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`,'utf-8'))
const users =JSON.parse(fs.readFileSync(`${__dirname}/users.json`,'utf-8'))

const importData = async()=>{
    try{
        await Tour.create(tours)
        await User.create(users,{validateBeforeSave:false})
        await Review.create(reviews)
        console.log('data successfuly updated')
    }
    catch(err){
        console.log(err)
    }
    process.exit()
}

const deleteData = async()=>{
    try{
        await Tour.deleteMany()
        await User.deleteMany()
        await Review.deleteMany()
        console.log('data successfuly deleted')
    }
    catch(err){
        console.log(err)
    }
    process.exit()
}

if(process.argv[2]==='--import'){
    return importData()
}
else if(process.argv[2]==='--delete'){
    return deleteData()
}


console.log(process.argv)