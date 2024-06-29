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

const localLogin = asyncHandler(async (req, res, next) => {
    passport.authenticate('local', async (err, user, info) => {
        if (err) return next(err);

        if (!user) return res.status(400).json(new ApiError(400, "Local Passport Strategy :Bad Request"));

        const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);
        const loggedInUser = User.findById({ _id: user._id }).select("-password -refreshToken -googleId");

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(new ApiResponse(200,
                {
                    user: loggedInUser, accessToken, refreshToken
                },
                "User logged in Successfully"));

    })
});

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

    // Redirect to dashboard
    return res.redirect('http://localhost:3000/home');
});

const logout = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id,
        {
            $set:
            {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    );

    return res.
        status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged Out Successfully"));
});
module.exports = {
    localLogin,
    googleLogin,
    logout
}