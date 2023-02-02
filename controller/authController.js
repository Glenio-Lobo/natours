import { User } from "../models/userModel.js";
import { catchAsync } from "../utils/catchAsync.js";

export const createUser = catchAsync(async function(request, response, next){
    const newUser = await User.create(request.body);

    response.status(201).json({
        status: 'sucess',
        user: newUser
    })
});