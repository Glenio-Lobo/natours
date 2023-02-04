import { User } from "../models/userModel.js";
import { catchAsync } from "../utils/catchAsync.js";
import { AppError } from "../utils/appError.js";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { promisify } from 'util';

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
        passwordConfirmed: request.body.passwordConfirmed,
        passwordChanged: request.body.passwordChanged
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

export const protectAccess = catchAsync(async function(request, response, next){
    // 1) Obtenha o token JWT e verifica se ele existe
    let token;

    if(request.headers.authorization && request.headers.authorization.startsWith('Bearer')) 
        token = request.headers.authorization.split(' ')[1];
    
    if(!token) return next(new AppError('Você não está logado no sistema. Por favor, entre na sua conta.', 401));

    // 2) Valida o token
    // Verifica se o token não expirou e se alguém monipulou os dados.
    const payload = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    // console.log(payload);

    // 3) Verifica se o user existe
    const user = await User.findById({ _id: payload.id });
    if(!user) return next(new AppError('O token não corresponde a nenhum usuário existente. Por favor, entre na sua conta.', 401));

    // 4) Checa se o usuário mudou de senha depois da assinatura do JWT
    if(user.changedPasswordAfter(payload.iat)) 
        return next(new AppError('A senha foi alterada. Por favor, entre novamente na sua conta.', 401));

    // 5) Permite a passagem se chegar nesse ponto
    request.user = user;
    next();
});