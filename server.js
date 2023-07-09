const mongoose=require('mongoose')
const dotenv = require('dotenv')

process.on('unhandledRejection',err=>{
    console.log('UNCAUGHT EXCEPTION !❌ Shutting down...☢️')
    console.log(err.name,err.message)
    process.exit(1)
})

dotenv.config({path:'./config.env'})
const app = require('./app')

const DB = process.env.DATABASE.replace('<PASSWORD>',process.env.DATABASE_PASSWORD);
mongoose.connect(DB,{
    useUnifiedTopology: true,
    useNewUrlParser:true,
    useCreateIndex:true,
    useFindAndModify:false
}).then(()=> console.log('successful connection !'))

const server = app.listen(3000||process.env.PORT,()=>console.log('server is running'))

process.on('unhandledRejection',err=>{
    console.log('UNHANDLED REJECTION !❌ Shutting down .☢️')
    console.log(err.name,err.message)
    server.close(()=>{
        process.exit(1)
    })
})
