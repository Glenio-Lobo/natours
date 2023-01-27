import mongoose from 'mongoose';
import slugify from 'slugify';

const toursSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Must have a name...'],
        unique: true,
        trim: true
    },
    slug: {
        type: String
    },
    duration: {
        type: Number,
        required: [true, "A tour must have a duration."]
    },
    maxGroupSize: {
        type: Number,
        required: [true, "A tour must have a group size."]
    },
    difficulty:{
        type: String,
        required: [true, "A tour must have a difficulty."]
    },
    ratingsAverage: {
        type: Number,
        default: 0
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, "A tour must have a price."]
    },
    discount: {
        type: Number,
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

    console.log(this.pipeline());
    next();
});

//Model
const Tour = mongoose.model('Tour', toursSchema);

export { Tour };