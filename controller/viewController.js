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

export const getTour = function(request, response){
    response.status(200).render('tour', {
        title: 'Florest Hiker'
    })
}