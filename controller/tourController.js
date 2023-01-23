import { fileURLToPath } from 'url';
import fs from 'fs';
import { Tour } from './../models/tourModel.js';
import { APIFeatures } from '../utils/apiFeatures.js';

// const __dirname = fileURLToPath(new URL('..', import.meta.url));
// const toursData  = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`));


// Solução 1 para a implementação de alias para rotas, não muito boa, resulta em 2 requests.
// export async function aliasTopTours(request, response){
//     response.redirect(`${request.baseUrl}/?limit=5&sort=-ratingsAverage,-price`);
// }

//Solução 2 usando middlewares para alterar o corpo do objeto query.
export async function aliasTopTours(request, response, next){
    request.query.limit = 5;
    request.query.sort = '-ratingsAverage,-price';
    request.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
}

export async function getAllTours(request, response) {
    try{ 

        //Esperando os documentos de resposta da query do .find();
        const features = new APIFeatures(Tour.find(), request.query)
            .filter()
            .sort()
            .limitFields()
            .paginate();
        const allTours = await features.query;
                
        response.status(200).json({
            status: 'sucess',
            results: allTours.length,
            data: {
                tours: allTours
            }
        });
    }catch(err){
        response.status(404).json({
            status: 'fail',
            message: err.message
        })
    }
}

export async function getTour(request, response){

    try{
        const tour = await Tour.findById(request.params.id);
        console.log(request.params.id, tour);
        response.status(200).json({ 
            status: 'sucess', 
            data: { tour: tour }
        });
    }catch(err){
        response.status(404).json({
            status: 'fail',
            message: 'Could not retrieve data.'
        });
    }
}

export async function createNewTour(request, response){
    try{
        const newTour = await Tour.create(request.body);
        response.status(201).json({
            status: 'sucess',
            tour: newTour
        });
    }catch(err){
        response.status(400).json({
            status: 'fail',
            message: "Validation error."
        });
    }
}

export async function updateTour(request, response){
    try{
        const updateOptions = {
            new: true,
            runValidators: true
        };

        const tour = await Tour.findByIdAndUpdate(request.params.id, request.body, updateOptions);

        response.status(201).json({
            message: 'sucess',
            data: {
                tour: tour
            }
        });
    }catch(err){
        response.status(404).json({
            status: 'fail',
            message: err
        });
    }
}

export async function deleteTour(request, response){
    try{
        const tour = await Tour.findByIdAndDelete(request.params.id, request.body);

        response.status(204).json({
            message: 'sucess',
            data: {
                tour: tour
            }
        });
    }catch(err){
        response.status(404).json({
            status: 'fail',
            message: err
        });
    }
}   

export async function getToursStats(request, response){
    try{
        const stats = await Tour.aggregate([
            {
                $match: { ratingsAverage: { $gte: 4.5 } },
            },
            {
                $group: {
                     _id: "$difficulty",
                     numTours: { $sum: 1 },
                     numRatings: {$sum: '$ratingsQuantity'},
                     avgRating: { $avg: '$ratingsAverage' },
                     avgPrice: { $avg: '$price'},
                     minPrice: { $min: '$price'},
                     maxPrice: { $max: '$price'}
                }
            },
            {
                $sort: {
                    avgPrice: 1
                }
            }
        ]);

        response.status(200).json({
            message: 'sucess',
            data: {
                stats: stats
            }
        });
    }catch(err){
        response.status(404).json({
            status: 'fail',
            message: err
        });
    }
}