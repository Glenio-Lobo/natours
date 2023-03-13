import { AppError } from "../utils/appError.js";
import { catchAsync } from "../utils/catchAsync.js";
import { User } from "../models/userModel.js";
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

export const uploadUserPhoto = upload.single('photo');

export const resizeUserPhoto = function(request, response, next){
    if(!request.file) return next();

    request.file.filename = `user-${request.user.id}-${Date.now()}.jpeg`;

    sharp(request.file.buffer)
        .resize(500, 500)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/users/${request.file.filename}`);
    
    next();
}

function filterObj(obj, ...allowedFields){
    const newObj = {};

    Object.keys(obj).forEach( key => {
        if(allowedFields.includes(key)) newObj[key] = obj[key];
    });

    return newObj;
}

export const updateMe = catchAsync(async function(request, response, next){
    // 1) Crie error se o usuário tentar mudar a senha
    if(request.body.password ||  request.body.passwordConfirmed) 
        return next(new AppError('Não é possível atualizar a senha por essa página. Tente /updateMyPassword', 400));

    // 2) Atualize o document do usuário
    const filteredBody = filterObj(request.body, "name", "email");
    if(request.file) filteredBody.photo = request.file.filename;

    // Usa o findIdAndUpdate para não rodar o Document Middleware de Save e não rodar o validate
    const updatedUser = await User.findByIdAndUpdate(request.user.id, filteredBody, 
        { 
            new: true, 
            runValidators: true 
        }
    );

    response.status(200)
        .json({ 
            status: 'success',
            data: {
                user: updatedUser
            }
        })
});

// Deleta o usuário logado atualmente pelo pedido do próprio usuário.
export const deleteMe = catchAsync( async function(request, response, next){
    await User.findByIdAndUpdate(request.user.id, { active: false });

    response.status(200)
        .json({
            status: "success",
            data: null
        })
});

export const getMe = function(request, response, next){
    request.params.id = request.user.id;
    next();
}

export const getAllUsers = Factory.getAllDocuments(User);
export const getUser = Factory.updateDocument(User);
export const updateUser = Factory.updateDocument(User);
// Só o administrador poderá deletar um documento.
export const deleteUser = Factory.deleteOneDocument(User);
