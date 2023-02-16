import { Review } from "../models/reviewModel.js";
import { APIFeatures } from '../utils/apiFeatures.js';
import { catchAsync } from '../utils/catchAsync.js';
import { AppError } from '../utils/appError.js';


export const getAllReviews = catchAsync(async function(request, response, next){
    const features = new APIFeatures(Review.find(), request.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();
    const allReviews = await features.query;
            
    response.status(200).json({
        status: 'sucess',
        results: allReviews.length,
        data: {
            reviews: allReviews
        }
    });
});

export const createReview = catchAsync(async function(request, response, next){
    // Permite Rotas Aninhadas
    if(!request.body.tour) request.body.tour = request.params.tourId;
    // Obtido no Protect Acess, que obriga o usuário a logar e salva o usuário da seção atual.
    if(!request.body.user) request.body.user = request.user.id; 

    const review = await Review.create(request.body);

    response.status(201).json({
        status: 'sucess',
        review: review
    });
});

export const getReview = catchAsync(async function(request, response, next){
    const review = await Review.findById(request.params.id);

    if(!review) return next(new AppError('Review não encontrado', 404));

    response.status(201).json({
        status: 'sucess',
        data: { review }
    });
});