import mongoose from 'mongoose';
import slugify from 'slugify';
import validator from 'validator';

const toursSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Must have a name...'],
        unique: true,
        trim: true,
        maxLength: [40, 'O tamanho máximo do nome deve ser de 40 caracteres.'],
        minLength: [10, 'O tamanho mínimo do nome deve ser de 10 caracteres.']
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
    }
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
    toJSON: { virtuals: true }
}); 

toursSchema.virtual('durationWeeks').get(function(){
    return this.duration / 7;
});

//Document Middleware
toursSchema.pre('save', function(next){
    this.slug = slugify(this.name, {lower: true});
    next();
});

//Query Middleware
toursSchema.pre(/^find/, function(next){
    this.find({secretTour: {$ne: true}});
    next();
});

//Agreggation Middleware
toursSchema.pre('aggregate', function(next){
    //Adiciona um novo estágio match no inicio do array
    this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });

    // console.log(this.pipeline());
    next();
});

//Model
const Tour = mongoose.model('Tour', toursSchema);

export { Tour };