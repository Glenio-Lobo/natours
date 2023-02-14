import mongoose from 'mongoose';

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
    console.log('Teste, entrei.');

    this.populate({
        path: 'user',
        select: 'name photo'
    }).populate({
        path: 'tour',
        select: 'name'
    });

    next();
});

const Review = mongoose.model('Review', reviewSchema);

export { Review };