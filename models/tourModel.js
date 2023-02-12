import mongoose from 'mongoose';
import slugify from 'slugify';
import validator from 'validator';
// import { User } from './userModel.js';

const toursSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Must have a name...'],
        unique: true,
        trim: true,
        maxlength: [40, 'O tamanho máximo do nome deve ser de 40 caracteres.'],
        minlength: [10, 'O tamanho mínimo do nome deve ser de 10 caracteres.']
        // validate: [validator.isAlpha, 'O nome não pode conter números.']
    },
    slug: {
        type: String
    },
    duration: {
        type: Number,
        required: [true, "A tour must have a duration."],
        min: [0, "Duration cannot be negative."]
    },
    maxGroupSize: {
        type: Number,
        required: [true, "A tour must have a group size."]
    },
    difficulty:{
        type: String,
        required: [true, "A tour must have a difficulty."],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: `O valor {VALUE} não é aceito. Deve ser: easy, medium, difficult`
        }
    },
    ratingsAverage: {
        type: Number,
        default: 0,
        min: [1, 'A menor avaliação aceitável é 1.'],
        max: [5, 'A maior validação aceitável é 5.']
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, "A tour must have a price."]
    },
    priceDiscount: {
        type: Number,
        validate: {
            validator: function(value){
                //Verifica de o desconto é maior que o preço do tour.
                //This aponta para o documento na CRIAÇÃO de um novo documento.
                //No update this aponta para a query, a validação não funciona com o update.
                // console.log(this, this.price);
                return value < this.price;
            },
            message: 'O preço do desconto ({VALUE}) não deve ser maior que o preço do tour.'
        },
        default: 0
    },
    summary: {
        type: String,
        trim: true,
        required: [true, "A tour must have a summary."]
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        required: [true, 'A tour must have a cover image.']
    },
    images: {
        type: [String]
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    startDates: {
        type: [Date]
    },
    secretTour: {
        type: Boolean,
        default: false
    },
    startLocation: {
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number], //[Longitude 1, latitude 2]
        adress: String,
        description: String
    },
    locations: [
        {
            type: {
                type: String,
                default: 'Point',
                enum: ['Point']
            },
            coordinates: [Number], //[Longitude 1, latitude 2]
            adress: String,
            description: String,
            day: Number // Dia em que o local será visitado no tour.
        }
    ],
    guides: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        }
    ]
},  
// {
//     virtuals: {
//         durationWeeks: {
//             get () {
//                 return this.duration / 7;
//             }
//         }
//     }
// },
{
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
}); 

toursSchema.virtual('durationWeeks').get(function(){
    return this.duration / 7;
});

//Document Middleware -> This aponta para o documento. Só roda no .save() .create()
toursSchema.pre('save', function(next){
    this.slug = slugify(this.name, {lower: true});
    next();
});

// Embedding Users no Tours
// toursSchema.pre('save', async function(next){
//     // Novos tours vão receber um array de guias
//     // 1) Loop sobre o array guide e gera um array com as promises das buscas
//     const userGuidesPromises = this.guides.map(async id => {
//         return await User.findById(id);
//     })

//     // 2) Executa todas as promisses ao mesmo tempo e substitui o valor de guides pelo documentos dos usuários buscados
//     this.guides = await Promise.all(userGuidesPromises);

//     next();
// });



//Query Middleware -> This aponta para query.
toursSchema.pre(/^find/, function(next){
    this.find({secretTour: {$ne: true}});
    next();
});

//Agreggation Middleware -> This aponta para a agregação.
toursSchema.pre('aggregate', function(next){
    //Adiciona um novo estágio match no inicio do array
    this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });

    // console.log(this.pipeline());
    next();
});

//Model
const Tour = mongoose.model('Tour', toursSchema);

export { Tour };