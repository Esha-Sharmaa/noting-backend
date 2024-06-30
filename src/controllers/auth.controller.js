const asyncHandler = require('../utils/asyncHandler.js');
const User = require("../modals/user.modal.js");
const passport = require("passport");
const ApiError = require('../utils/ApiError.js');
const ApiResponse = require('../utils/ApiResponse.js');

const options = {
    httpOnly: true,
    secure: true
}

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findOne({ _id: userId });
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save();
        return { accessToken, refreshToken };
    } catch (error) {
        console.log("Error while generating tokens", error.message);
        throw new ApiError(500, "Something went wrong while generating tokens");
    }
}


const googleLogin = asyncHandler(async (req, res) => {
    const user = req.user;

    // Generate access and refresh tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    // Define cookie options
    const cookieOptions = {
        httpOnly: true,         // Prevent client-side access to the cookies
        secure: process.env.NODE_ENV === "production",  // Use secure cookies in production
        sameSite: "Strict",     // Prevent CSRF attacks
        maxAge: 24 * 60 * 60 * 1000,  // 1 day
    };

    // Set cookies for access and refresh tokens
    res.cookie("accessToken", accessToken, cookieOptions);
    res.cookie("refreshToken", refreshToken, cookieOptions);

    // Redirect to home
    return res.redirect('http://localhost:3000/home');
});


module.exports = {

    googleLogin,
}