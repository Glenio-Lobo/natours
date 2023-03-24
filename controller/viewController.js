import { Tour } from "../models/tourModel.js";
import { User } from "../models/userModel.js";
import { Booking } from "../models/bookingModel.js";
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

export const getLoginForm = function(request, response){
    response.status(200).render('login', {
        title: 'Login'
    })
};

export const getAccount = function(request, response){
    response.status(200).render('account', {
        title: 'Your Account'
    })
};

export const getMyTours = catchAsync(async function(request, response) {
    // 1) Encontre os bookings
    const bookings = await Booking.find({user: request.user.id});

    // 2) Encontre os tours com os ids retornados
    const toursID = bookings.map(booking => booking.tour);
    const tours = await Tour.find(
        { _id: {$in: toursID} } // MongoDB operator que retornar todos os tours dentro de um array
    );
    
    response.status(200).render('overview', {
        title: 'My Tours',
        tours
    })
})

export const alerts = function(request, response, next){
    const { alert } = request.query;

    if(alert === 'booking')
        response.locals.alert = "Your booking was successful! Please check your email for confirmation. If your booking doesn't show up immediatly, please come back later."
    
    next();
}