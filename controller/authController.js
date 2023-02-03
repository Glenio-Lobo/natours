import { User } from "../models/userModel.js";
import { catchAsync } from "../utils/catchAsync.js";
import jwt from 'jsonwebtoken';

export const createUser = catchAsync(async function(request, response, next){
    // Errado, não crie um usuário usando todos os dados que vem do body.
    // const newUser = await User.create(request.body);

    const newUser = await User.create({
        name: request.body.name,
        email: request.body.email,
        password: request.body.password,
        passwordConfirmed: request.body.passwordConfirmed
    });

    const tokenJWT = jwt.sign(
        { id: newUser._id }, 
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    response.status(201).json({
        status: 'sucess',
        token: tokenJWT,
        user: newUser
    })
});