import { Tour } from "../models/tourModel.js";
import { catchAsync } from "../utils/catchAsync.js";

export const getOverview = catchAsync(async function(request, response, next){
    // 1) Obtenha os dados da coleção
    const tours = await Tour.find();

    // 2) Crie o template
    // 3) Renderize o template
    response.status(200).render('overview', {
        title: 'All Tours',
        tours
    })
})

export const getTour = catchAsync(async function(request, response){
     // 1) Obtenha os dados da coleção (Incluindo review e guides.)
     const tour = await Tour.find({slug: request.params.slug}).populate({
        path: 'reviews',
        fields: 'review rating user'
    });

     // 2) Crie o template
     // 3) Renderize o template
    response.status(200).render('tour', {
        title: tour[0].name
    })
})