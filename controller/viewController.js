import { Tour } from "../models/tourModel.js";
import { catchAsync } from "../utils/catchAsync.js";
import { AppError } from "../utils/appError.js";

export const getOverview = catchAsync(async function(request, response, next){
    // 1) Obtenha os dados da coleção
    const tours = await Tour.find();
    
    if(!tours) return next(new AppError("There is no tours.", 404));

    // 2) Crie o template
    // 3) Renderize o template
    response.status(200).render('overview', {
        title: 'All Tours',
        tours
    })
})

export const getTour = catchAsync(async function(request, response, next){
     // 1) Obtenha os dados da coleção (Incluindo review e guides.)
     const tour = await Tour.findOne({slug: request.params.slug}).populate({
        path: 'reviews',
        fields: 'review rating user'
    });

    
    if(!tour) return next(new AppError("There is no tour with that name.", 404));

     // 2) Crie o template
     // 3) Renderize o template
    response.status(200).render('tour', {
        title: tour.name,
        tour: tour
    })
})

export const getLoginForm = catchAsync(async function(request, response){
    response.status(200).render('login', {
        title: 'Login'
    })
});

export const getAccount = catchAsync(async function(request, response){
    response.status(200).render('account', {
        title: 'Your Account'
    })
})