import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'User must have a name...']
    },
    email: {
        type: String,
        required: [true, 'User must have a email...'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'The email {VALUE} is invalid. Please insert a valid email.']
    },
    photo: String,
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'User must have a password...'],
        minlength: 8,
        select: false
    },
    passwordConfirmed: {
        type: String,
        required: [true, 'Please confirm your password...'],
        minlength: 8,
        validate: {
            // Só funciona em .save() e .create(), não com findOneAndUpdate e etc.
            // É necessário usar SAVE() para o update da password
            validator: function (value){
                return value === this.password;
            },
            message: 'Password and Password Confirmed are Different. Please insert the same password.'
        }
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: String,
    active: {
        type: Boolean,
        select: false,
        default: true
    }
});

userSchema.pre('save', async function(next){
    // Se a senha foi modificada, então retorna.
    // Evita encriptar a senha novamente em qualquer atualização que não seja na password.
    if(!this.isModified('password')) return next();

    // Se não foi, então encripta ela usando bcrypt.
    this.password = await bcrypt.hash(this.password, 12);

    // Remove a senha de confirmação
    this.passwordConfirmed = undefined;

    next();
});

userSchema.pre('save', function(next){
    if(!this.isModified('password') || this.isNew) return next();

    this.passwordChangedAt = Date.now() - 1000;

    next();
});

userSchema.pre(/^find/, function(next){
    // Garante que apenas o documentos ativos serão encontrados
    this.find( { active: {$ne: false } } );
    next();
});

userSchema.methods.correctPassword = async function(candidatePassword, userPassword){
    return await bcrypt.compare(candidatePassword, userPassword);
}

userSchema.methods.changedPasswordAfter = function(JWTTimeStamp){
    if(this.passwordChangedAt){
        const changeTimeStamp = Number.parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        if(changeTimeStamp > JWTTimeStamp) return true;
    }

    // False significa que a senha não mudou.
    return false;
}

userSchema.methods.generatePasswordResetToken = function(){
    // Gerando reset password com 32 bytes randômicos convertidos para uma string hexadecimal
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Criptografa  o token gerado
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Data de expiração setada para 10 minutos após a criação do token
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    //Retorna o token de reset
    return resetToken;
}

const User = mongoose.model('User', userSchema);

export { User };