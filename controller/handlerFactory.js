import { AppError } from "../utils/appError.js";
import { catchAsync } from "../utils/catchAsync.js";

export const deleteOneDocument = function(Model){
    return catchAsync( async function(request, response, next){
        const doc = await Model.findByIdAndDelete(request.params.id, request.body);
    
        if(!doc) return next(new AppError('Tour não encontrado', 404));
    
        response.status(204).json({
            message: 'sucess',
            data: null
        });
    })
}
