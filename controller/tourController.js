// import { fileURLToPath } from 'url';
// import fs from 'fs';
import { Tour } from './../models/tourModel.js';
import { catchAsync } from '../utils/catchAsync.js';
import { AppError } from '../utils/appError.js';
import * as Factory from './handlerFactory.js';
import multer from 'multer';
import sharp from 'sharp';

/*
 * Multer is a node.js middleware for handling multipart/form-data, which is primarily used for uploading files. 
 * It is written on top of busboy for maximum efficiency.
 * 
 * Se não for especificado um caminho, salva na memória.
*/
// const multerStorage = multer.diskStorage({
//     destination: (request, file, callbackMulterNext) => {
//         callbackMulterNext(null, 'public/img/users');
//     },
//     filename: (request, file, callbackMulterNext) => {
//         const extension = file.mimetype.split('/')[1];
//         callbackMulterNext(null, `user-${request.user.id}-${Date.now()}.${extension}`);
//     }
// });

const multerMemoryStorage = multer.memoryStorage();

const multerFilter = (request, file, callbackMulterNext) => {
    if(file.mimetype.startsWith('image')){
        callbackMulterNext(null, true);
    }else{
        callbackMulterNext(new AppError('Not a image. Please upload only images.', 400), false);
    }
}

const upload = multer({ storage: multerMemoryStorage, fileFilter: multerFilter });

export const uploadTourImages = upload.fields([
    { name: 'imageCover', maxCount: 1 },
    { name: 'images', maxCount: 3}
]);

export const resizeTourImages = catchAsync(async function(request, response, next){
    if(!request.files.images || !request.files.imageCover) return next();

    // ImageCover
    request.body.imageCover = `tour-${request.params.id}-${Date.now()}-cover.jpeg`;
    
    await sharp(request.files.imageCover[0].buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${request.body.imageCover}`);
    
    // Images
    request.body.images = [];
    /*
     * Necessário salvar todas as promisses, pq o async e await não impede da função next ser rodada após
     * a execução do código da callback. Apenas o código dentro da callback espera o await.
     * Isso ocorre pois o async await é uma callback do forEach/map.
     * Roda todas as promisses ao mesmo tempo usando Promisses.all para executar elas.
    */
    const imagesPromisses = request.files.images.map(async (img, index) => {
        request.body.images.push(`tour-${request.params.id}-${Date.now()}-${index+1}.jpeg`);

        await sharp(img.buffer)
            .resize(2000, 1333)
            .toFormat('jpeg')
            .jpeg({ quality: 90 })
            .toFile(`public/img/tours/${request.body.images[index]}`);
    })

    await Promise.all(imagesPromisses);

    next();
});


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

export const getAllTours = Factory.getAllDocuments(Tour);
export const getTour = Factory.getDocument(Tour, {   
    path: 'reviews'   
})
export const createNewTour = Factory.createNewDocument(Tour);
export const updateTour = Factory.updateDocument(Tour);
export const deleteTour = Factory.deleteOneDocument(Tour);

export const getDistance = catchAsync(async function(request, response, next){
    const { latlng, unit } = request.params;
    const [lat, lng] = latlng.split(',');

    if(!lat || !lng) return next(new AppError('Por favor, informe os dados no formato lat,lng', 400));

    const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

    const distance = await Tour.aggregate([
        {
            $geoNear: {
                near: {
                    type: 'Point',
                    coordinates: [lng * 1, lat * 1]
                },
                distanceField: 'distance',
                distanceMultiplier: multiplier
            }
        },
        { 
            $project: {
                distance: 1,
                name: 1
            }
        }
    ]);

    response.status(200)
            .json({
                status: 'sucess',
                data: {
                    distance
                }
            });
})

export const getToursWithin = catchAsync(async function(request, response, next){
    const { distance, latlng, unit } = request.params;
    const [lat, lng] = latlng.split(',');

    if(!lat || !lng) return next(new AppError('Por favor, informe os dados no formato lat,lng', 400));

    const radius = unit === 'mi' ? distance/3932.2 : distance/6378.1;

    const tours = await Tour.find({
        startLocation: { 
            $geoWithin: { 
                $centerSphere: [[lng, lat], radius]
            }
        }
    });

    response.status(200)
            .json({
                status: 'sucess',
                results: tours.length,
                data: {
                    tours
                }
            });
})

export const getToursStats = catchAsync(async function(request, response, next){
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
});

export const getMonthlyPlan = catchAsync(async function(request, response, next){
    const year = Number.parseInt(request.params.year);
    const plan = await Tour.aggregate([
        {
            $unwind: "$startDates"
        },
        {
            $match: { 
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`)
                }
            }
        },
        {
            $group: {
                _id: { $month: '$startDates' },
                numTourStarts: { $sum: 1 },
                tours: { $push: '$name'} //Cria uma array com todos os nomes. $push.
            }
        },
        {
            $addFields: { month: '$_id'}
        },
        {
            $project: {
                _id: 0
            }
        },
        {
            $sort: {
                numTourStarts: -1
            }
        }
    ]);

    response.status(200).json({
        message: 'sucess',
        numTours: plan.length,
        data: {
            plan: plan
        }
    });
});

// export const getAllTours = catchAsync(async function (request, response, next) {
//     //Esperando os documentos de resposta da query do .find();
//     const features = new APIFeatures(Tour.find(), request.query)
//         .filter()
//         .sort()
//         .limitFields()
//         .paginate();
//     const allTours = await features.query;
            
//     response.status(200).json({
//         status: 'sucess',
//         results: allTours.length,
//         data: {
//             tours: allTours
//         }
//     });
// });

// export const getTour = catchAsync( async function (request, response, next){
//     const tour = await Tour.findById(request.params.id).populate({
//         path: 'reviews'
//     });

//     if(!tour) return next(new AppError('Tour não encontrado', 404));
    
//     response.status(200).json({ 
//         status: 'sucess', 
//         data: { tour: tour }
//     });
// });

// export const createNewTour = catchAsync(async function(request, response, next){
    //     const newTour = await Tour.create(request.body);
//     response.status(201).json({
//         status: 'sucess',
//         tour: newTour
//     });
// });

// export const updateTour = catchAsync( async function (request, response, next){
//     const updateOptions = {
//         new: true,
//         runValidators: true
//     };

//     const tour = await Tour.findByIdAndUpdate(request.params.id, request.body, updateOptions);

//     if(!tour) return next(new AppError('Tour não encontrado', 404));

//     response.status(201).json({
//         message: 'sucess',
//         data: {
//             tour: tour
//         }
//     });
// });

// export const deleteTour = catchAsync( async function(request, response, next){
//     const tour = await Tour.findByIdAndDelete(request.params.id, request.body);

//     if(!tour) return next(new AppError('Tour não encontrado', 404));

//     response.status(204).json({
//         message: 'sucess',
//         data: {
//             tour: tour
//         }
//     });
// });