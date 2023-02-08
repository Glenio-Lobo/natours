import { AppError } from "../utils/appError.js";
import { catchAsync } from "../utils/catchAsync.js";
import { User } from "../models/userModel.js";

function filterObj(obj, ...allowedFields){
    const newObj = {};

    Object.keys(obj).forEach( key => {
        if(allowedFields.includes(key)) newObj[key] = obj[key];
    });

    return newObj;
}

export async function updateMe(request, response, next){
    // 1) Crie error se o usuário tentar mudar a senha
    if(request.body.password ||  request.body.passwordConfirmed) 
        return next(new AppError('Não é possível atualizar a senha por essa página. Tente /updateMyPassword', 400));

    // 2) Atualize o document do usuário
    const filteredBody = filterObj(request.body, "name", "email");

    // Usa o findIdAndUpdate para não rodar o Document Middleware de Save
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
}

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

export function deleteUser(request, response) {
    response.status(400).json({
        status: 'fail',
        message: 'Não implementado.'
    })
}