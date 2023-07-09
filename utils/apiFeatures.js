class apiFeatures{

constructor(query,queryString){
    this.query = query ;
    this.queryString = queryString ;
}

filter(){
    //filter with some words
    const queryObj = {...this.queryString}
    const excludedWords=['fields','page','limit','sort']
    excludedWords.forEach(el=>delete queryObj[el])

//Advanced filter using operators
    let queryStr = JSON.stringify(queryObj)
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g,match=>`$${match}`)
    this.query.find(JSON.parse(queryStr))
    // let query =Tour.find(JSON.parse(queryStr))
    return this ;
}

sort(){
    //sorting
    if(this.queryString.sort){
        //split and join for sorting with two params or variables
        const sortBy = this.queryString.sort.split(',').join(' ')
        this.query = this.query.sort(sortBy)
    }else{
        this.query = this.query.sort('name')
    }
    return this ;
}

limit(){
     //field limitations
    if(this.queryString.fields){
        const fieldLimit = this.queryString.fields.split(',').join(' ')
        this.query = this.query.select(fieldLimit)
    }else{
        this.query = this.query.select('-__v')
    }
    return this ;
}

paginate(){
    //pagination
    const page = this.queryString.page*1 || 1
    const limit = this.queryString.limit*1 || 10
    const skip = ( page - 1 ) * limit
    this.query = this.query.skip(skip).limit(limit)
    return this ;
}
}

module.exports=apiFeatures