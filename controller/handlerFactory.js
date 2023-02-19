import { AppError } from "../utils/appError.js";
import { catchAsync } from "../utils/catchAsync.js";

export const deleteOneDocument = function(Model){
    return catchAsync( async function(request, response, next){
        const doc = await Model.findByIdAndDelete(request.params.id, request.body);
    
        if(!doc) return next(new AppError('Documento não encontrado', 404));
    
        response.status(204).json({
            message: 'sucess',
            data: null
        });
    })
}

export const updateDocument = function(Model){
    return catchAsync( async function (request, response, next){
        const updateOptions = {
            new: true,
            runValidators: true
        };
    
        const doc = await Model.findByIdAndUpdate(request.params.id, request.body, updateOptions);
    
        if(!doc) return next(new AppError('Documento não encontrado', 404));
    
        response.status(201).json({
            message: 'sucess',
            data: {
                data: doc
            }
        });
    })
}

export const createNewDocument = function(Model){
    return catchAsync(async function(request, response, next){
        const newDocument = await Model.create(request.body);
        response.status(201).json({
            status: 'sucess',
            data: newDocument
        });
    })
};