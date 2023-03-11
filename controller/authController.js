import { User } from "../models/userModel.js";
import { catchAsync } from "../utils/catchAsync.js";
import { AppError } from "../utils/appError.js";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { promisify } from 'util';
import sendEmail from "../utils/email.js";
import crypto from 'crypto';

function generateSignToken(id){
    return jwt.sign(
        { id }, 
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );
}

function createSendToken(user, statusCode, response){
    const tokenJWT = generateSignToken(user._id); 
    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRESIN * 24 * 60 * 60 * 1000),
        secure: false, // Cookie só sera enviado em conexões HTTPS
        httpOnly: true // Barra o browser de ser capaz de modificar o cookie, apenas http terão permissão
        // sameSite: 'none', // Necessário para que o chrome envio o cooki para o browser
        // path: '/',
    };
    
    if(process.env.NODE_ENV === 'production') cookieOptions.secure = true;

    response.cookie('jwt', tokenJWT, cookieOptions);
    
    user.password = undefined;
    response.status(statusCode).json({
        status: 'success',
        token: tokenJWT,
        user: user
    })
}

export const createUser = catchAsync(async function(request, response, next){
    // Errado, não crie um usuário usando todos os dados que vem do body.
    // const newUser = await User.create(request.body);

    const newUser = await User.create({
        name: request.body.name,
        email: request.body.email,
        password: request.body.password,
        passwordConfirmed: request.body.passwordConfirmed,
        passwordChanged: request.body.passwordChanged,
        role: request.body.role
    });

    createSendToken(newUser, 201, response);
});

export const login = catchAsync(async function(request, response, next){
    const { email, password } = request.body;


    // 1) Verifica se o email e password existe
    if(!email || !password) return next(new AppError(`Por favor insire um email e uma password!`, 400));

    // 2) Checa se o usuário existe e se o password tá correta
    const userResult = await User.findOne( { email: email }).select('+password');

    if(!userResult || ! (await userResult.correctPassword(password, userResult.password)) ) 
        return next(new AppError('Email ou Senha Incorretas, ou usuário não existe.', 400));

    // 3) Se tudo ta ok, envia o JWT token para o cliente
    createSendToken(userResult, 200, response);
});

// O usuário só terá acesso a certas rotas se estiver logado, essa função garante isso!
export const protectAccess = catchAsync(async function(request, response, next){
    // 1) Obtenha o token JWT e verifica se ele existe
    let token;

    // Autorização deve ser feita contendo um header "Bearer JWT TOKEN", se não for, então rejeita, usuário não está logado.
    if(request.headers.authorization && request.headers.authorization.startsWith('Bearer')) 
        token = request.headers.authorization.split(' ')[1];
    else if(request.cookies.jwt)
        token = request.cookies.jwt;
    
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

export const logout = function(request, response){
    response.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    })

    response.status(200).json({
        status: 'success'
    })
}

export const isLoggedIn = async function(request, response, next){
    // 1) Obtenha o token JWT e verifica se ele existe
    let token;

    if(request.cookies.jwt) {
        try{
            token = request.cookies.jwt;
    
            // 2) Valida o token
            // Verifica se o token não expirou e se alguém monipulou os dados.
            const payload = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
            // console.log(payload);
    
            // 3) Verifica se o user existe
            const user = await User.findById({ _id: payload.id });
    
            // 4) Checa se o usuário mudou de senha depois da assinatura do JWT
            if(!user || user.changedPasswordAfter(payload.iat))  return next();
            
            // 5) Permite a passagem se chegar nesse ponto
            response.locals.user = user; // Template tem acesso ao response locals
            return next();
        }catch(err){
            return next();
        }
    }
    next();
};

export const restrictTo = function(...roles){
    return (request, response, next) => {

        // Verifica se a role do uusário está dentro das permissões, se não está, não da permissão!
        if(!roles.includes(request.user.role)){
            return next(new AppError('Você não tem permissão para realizar essa tarefa', 403));
        }

        next();
    }
}

export const forgotPassword =  catchAsync(async function(request, response, next){
    // 1) Encontre o usuário baseado no email
    const user = await User.findOne({ email: request.body.email });

    if(!user) return next(new AppError('O Email inserido não corresponde a nenhum usuário.', 401));

    // 2) Gere um token de reset aleatório
    const resetToken = user.generatePasswordResetToken();
    await user.save( { validateBeforeSave: false } );

    // 3) Envie o token através do email
    const resetUrl = `${request.protocol}://${request.get('host')}/api/v1/users/resetPassword/${resetToken}`;
    const message = `Esqueceu a sua senha? Envie um PATCH request com a sua nova password e passwordConfirmed para o link: ${resetUrl}.\n
    Se você não requisitou a redefinição da senha, por favor ignore esse email!`;
    const subject = 'O seu token para resetar a senha. ( Válido por 10 minutos apenas )';

    try{
        await sendEmail({
            email: user.email,
            message,
            subject
        });

        response.status(200).json({
            status: 'success',
            message: 'Token enviado por email.'
        });

    }catch(err){
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save( { validateBeforeSave: false } );

        return next(new AppError('Error enviando  o email para a redefinição da senha. Tente novamente mais tarde.', 500));
    }

});

export const resetPassword = catchAsync(async function(request, response, next){
    // 1) Encontre o usuário baseado no token
    // $2a$12$LEVXHfhMIV3aoQq/mP/UB.TUfhclTOIL/yzoZIWv79wUmUJO9nxKC
    const { password, passwordConfirmed } = request.body;
    const tokenHashed = crypto
                    .createHash('sha256')
                    .update(request.params.token)
                    .digest('hex');;

    if(!tokenHashed) return next(new AppError('Insira um token válido.', 401));
    if(!password || !passwordConfirmed) return next(new AppError('Insira a password e a passwordConfirmed.', 401));

    const user = await User.findOne(
        { 
            passwordResetToken: tokenHashed,
            passwordResetExpires: { $gt: Date.now() } 
        }
    );

    // 2) Se o token não expirou e o usuário existe, troque a senha
    if(!user) return next(new AppError('Token expirou ou não corresponde a nenhum usuário.', 401));


    user.password = password;
    user.passwordConfirmed = passwordConfirmed;
    user.passwordResetExpires = undefined;
    user.passwordResetToken = undefined;

    // 3) Update changedPasswordAt
    //Feito no middleware antes de salvar

    // Salvando as alterações do usuário
    await user.save();

    // 4) Login automático do usuário
    createSendToken(user, 200, response);
});

/*
 * Função responsável por atualizar a senha do usuário que está logado.
 * Deve receber a senha atual do usuário para logar, e o usuário deve estar logado no sistema.
 * */
export const updatePassword = catchAsync(async function(request, response ,next){
    // 1) Obtenha o usuário 
    const user = await User.findById({ _id: request.user._id}).select('+password');
    if(!user) return next(new AppError('Por favor, log in no sistema para ter acesso a essa funcionalidade.', 401));

    // 2) Verifique se a senha passada é correta
    if(!user.correctPassword(request.body.passwordCurrent, user.password)) 
        return next(new AppError('A senha atual informada é incorreta!', 401));

    // 3) Se sim, atualize a senha
    user.password = request.body.password;
    user.passwordConfirmed = request.body.passwordConfirmed;
    await user.save();

    // 4) Login the user e envie o JWT token
    createSendToken(user, 200, response);
});