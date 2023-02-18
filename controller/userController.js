import { AppError } from "../utils/appError.js";
import { catchAsync } from "../utils/catchAsync.js";
import { User } from "../models/userModel.js";
import * as Factory from './handlerFactory.js';

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

    // Usa o findIdAndUpdate para não rodar o Document Middleware de Save e não rodar o validate
    const updatedUser = await User.findByIdAndUpdate(request.user.id, filteredBody, 
        { 
            new: true, 
            runValidators: true 
        }
    );

    response.status(200)
        .json({ 
            status: 'sucess',
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
            status: "sucess",
            data: null
        })
});

export function getAllUsers(request, response) {
    response.status(400).json({
        status: 'fail',
        message: 'Não implementado.'
    })
}

export function createNewUser(request, response) {
    response.status(400).json({
        status: 'fail',
        message: 'Não implementado.'
    })
}

export function getUserByUrlId(request, response) {
    response.status(400).json({
        status: 'fail',
        message: 'Não implementado.'
    })
}

export function updateUser(request, response) {
    response.status(400).json({
        status: 'fail',
        message: 'Não implementado.'
    })
}

// Só o administrador poderá deletar um documento.
export const deleteUser = Factory.deleteOneDocument(User);
