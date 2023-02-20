import mongoose from 'mongoose';
import { Tour } from './tourModel.js';

const reviewSchema = mongoose.Schema({
    review: {
        type: String,
        required: [true, 'The review must have a content...']
    },
    rating: {
        type: Number,
        required: [true, 'The review must have a rating...'],
        min: [1, 'The rating cannot be less than 1.'],
        max: [5, 'The rating cannot be more than 5.']
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Review must belong to a User.']
    },
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Review must belong to a Tour.']
    }
},
{
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

// Preenchendo User e Tour
reviewSchema.pre(/^find/, function(next){

    // this.populate({
    //     path: 'user',
    //     select: 'name photo'
    // }).populate({
    //     path: 'tour',
    //     select: 'name'
    // });

    this.populate({
       path: 'user',
       select: 'name photo'
    })

    next();
});

// Em métodos estáticos this aponta para o model, schema
reviewSchema.statics.calculateAverageRatings = async function(tourId){
    const stats = await this.aggregate([
        {
            $match: { tour: tourId } // Seleciona todos os reviews referentes ao tour Id
        },
        {
            $group: {
                _id: '$tour', // Agrupa as reviews por tour
                nRatings: { $sum: 1 }, // Soma um para cad documento
                avgRating: { $avg: '$rating' } // Calcula a média das avaliações
            }
        }
    ]);

    await Tour.findByIdAndUpdate(tourId, {
        ratingsQuantity: stats[0].nRatings,
        ratingsAverage: stats[0].avgRating
    });
}

reviewSchema.post('save', function(){
    // this.constructor aponta para o model.
    // console.log(this.constructor);
    this.constructor.calculateAverageRatings(this.tour);
});

// Atualiza ratings e ratingsAverage quando uma review é alterada ou deletada. findOneAndUpdate, findOneAndDelete
reviewSchema.pre(/^findOneAnd/, function(next){

});

const Review = mongoose.model('Review', reviewSchema);

export { Review };