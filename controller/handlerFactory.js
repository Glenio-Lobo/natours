import { AppError } from "../utils/appError.js";
import { catchAsync } from "../utils/catchAsync.js";
import { APIFeatures } from '../utils/apiFeatures.js';

export const getAllDocuments = function(Model) {
    return catchAsync(async function (request, response, next) {
        let filter = {};

        // Se vinher da rota /api/v1/tours/tourId/reviews, retorna todos os revies relacionados com o tourId.
        if(request.params.tourId) filter = { tour: request.params.tourId};

        //Esperando os documentos de resposta da query do .find();
        const features = new APIFeatures(Model.find(filter), request.query)
            .filter()
            .sort()
            .limitFields()
            .paginate();
        const allDocuments = await features.query;
                
        response.status(200).json({
            status: 'sucess',
            results: allDocuments.length,
            data: {
                data: allDocuments
            }
        });
    })
};

export const getDocument = function(Model, populateOptions = {}){
    return catchAsync( async function (request, response, next){
        let query = Model.findById(request.params.id);

        if(populateOptions) query = query.populate(populateOptions);

        const doc = await query;

    
        if(!doc) return next(new AppError('Documento não encontrado', 404));
        
        response.status(200).json({ 
            status: 'sucess', 
            data: { data: doc }
        });
    });
};
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