class AppError extends Error{
    constructor(message, statusCode){
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        // Adiciona o stack ( caminho ) do erro para o primeiro objeto passado com argumento.
        // A stack vai ignorar os objetos passados como argumento após o primeiro argumento, não irão parecer na stack trace.
        Error.captureStackTrace(this, this.constructor);
    }
}

export { AppError };