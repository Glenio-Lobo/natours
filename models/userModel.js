import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';

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
            message: 'Password is not identical.'
        }
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
});

userSchema.methods.correctPassword = async function(candidatePassword, userPassword){
    return await bcrypt.compare(candidatePassword, userPassword);
}

const User = mongoose.model('User', userSchema);

export { User };