export default function(err, request, response, next) {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    
    response.status(err.statusCode)
    .json({
        status: 'fail',
        message: err.message
    });
}