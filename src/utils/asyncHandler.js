const asyncHandler = (requestHandler) =>{
    return(req,res,next) =>{
        Promise.resolve(requestHandler(req,res,next)).catch((err) => next(err))
    }
}
module.exports = {asyncHandler}

// Har baar try-catch likhne ki jhanjhat khatam — bas apna async controller is mein wrap karo, errors automatically handle ho jaayenge.