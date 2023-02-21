import { AppError } from '../utils/appError.js';

function handleCastErrorDB(error){
    return new AppError(`Invalid ${error.path}: ${error.value}`, 400);
}

function handleDuplicateFieldsErrorDB(error){
    return new AppError(`${error.keyValue.name} já existe. Por favor, insira outro valor!`, 400);
}

function handleValidationError(error){
    let errorMessage = '';
    for(let err in error.errors) errorMessage = errorMessage.concat(`Error in ${err} value: ${error.errors[err].message}. `);
    
    return new AppError(errorMessage, 400);
}

function handleJWTError(error){
    return new AppError(`${error.name}: ${error.message}. Please log in again.`, 401);
}

function handleJWTExpirationError(error){
    return new AppError(`${error.name}: ${error.message}. Please log in again.`, 401);
}

function sendErrorDev(err, response){

    response.status(err.statusCode)
        .json({
            status: 'fail',
            message: err.message,
            stack: err.stack,
            error: err
    });
}

function sendErrorProd(err, response){

    //Erros de operação, mostra o erro ao cliente.
    if(err.isOperational){
        response.status(err.statusCode)
            .json({
                status: 'fail',
                message: err.message
        });

        //Erros de programação, esconde o erro do cliente.
    } else {
        console.error(err);

        response.status(500)
            .json({
                status: 'error',
                message: 'Alguma coisa deu muito errado!'
            })
    }
}

export default function(err, request, response, next) {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    
    if(process.env.NODE_ENV === 'development'){    
        sendErrorDev(err, response);
    }else if(process.env.NODE_ENV === 'production'){
        let error = {};

        if(err.name === 'CastError') error = handleCastErrorDB(err);
        else if(err.code === 11000) error = handleDuplicateFieldsErrorDB(err);
        else if(err.name === 'ValidationError') error = handleValidationError(err);
        else if(err.name === 'JsonWebTokenError') error = handleJWTError(err);
        else if(err.name === 'TokenExpiredError') error = handleJWTExpirationError(err);
        
        sendErrorProd(error, response);
    }
}