import { User } from "../models/userModel.js";
import { catchAsync } from "../utils/catchAsync.js";
import { AppError } from "../utils/appError.js";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

function generateSignToken(id){
    return jwt.sign(
        { id }, 
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );
}

export const createUser = catchAsync(async function(request, response, next){
    // Errado, não crie um usuário usando todos os dados que vem do body.
    // const newUser = await User.create(request.body);

    const newUser = await User.create({
        name: request.body.name,
        email: request.body.email,
        password: request.body.password,
        passwordConfirmed: request.body.passwordConfirmed
    });

    const tokenJWT = generateSignToken(newUser._id); 

    response.status(201).json({
        status: 'sucess',
        token: tokenJWT,
        user: newUser
    })
});

export const login = catchAsync(async function(request, response, next){
    const { email, password } = request.body;

    // 1) Verifica se o email e password existe
    if(!email || !password) return next(new AppError(`Por favor insire um email e uma password!`, 400));

    // 2) Checa se o usuário existe e se o password tá correta
    const userResult = await User.findOne( { email: email }).select('+password');

    if(!userResult || ! (await userResult.correctPassword(password, userResult.password)) ) 
        return next(new AppError('Email ou Senha Incorretas!', 401));

    // 3) Se tudo ta ok, envia o JWT token para o cliente
    const token = generateSignToken(userResult._id);
    response.status(200)
        .json({
            status: 'success',
            token
        });
});