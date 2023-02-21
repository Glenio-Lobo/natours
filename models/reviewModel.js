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

    if(stats.length > 0){
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: stats[0].nRatings,
            ratingsAverage: stats[0].avgRating
        });
    }else{
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: 0,
            ratingsAverage: 4.5
        });
    }
}

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.post('save', function(){
    // this.constructor aponta para o model.
    // console.log(this.constructor);
    this.constructor.calculateAverageRatings(this.tour);
});

// Atualiza ratings e ratingsAverage quando uma review é alterada ou deletada. findByIdAndUpdate, findByIdAndDelete
// findByIdAndUpdate ---> findOneAndUpdate({ _id: id })
// findByIdAndDelete ---> findOneAndDelete({ _id: id })
reviewSchema.pre(/^findOneAnd/, async function(next){
    this.reviewDoc = await this.clone().findOne();
    next();
});


// Só atualiza quando a review ja foi atualizada ou deletada
reviewSchema.post(/^findOneAnd/, async function(){
    await this.reviewDoc.constructor.calculateAverageRatings(this.reviewDoc.tour);
});

const Review = mongoose.model('Review', reviewSchema);

export { Review };