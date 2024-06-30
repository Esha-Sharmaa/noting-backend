const { validationResult, matchedData } = require("express-validator");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const User = require("../modals/user.modal");
const ApiResponse = require("../utils/ApiResponse");
const generateAccessAndRefreshToken = require("../utils/generateAccessAndRefreshToken.js");



const options = {
    httpOnly: true,
    secure: true
}

const registerUser = asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        let errobj = {};
        errors.errors.forEach(err => {
            errobj[err.path] = err.msg;
        });
        throw new ApiError(422, "Validation Errors", errobj);
    }

    const { fullName, email, password } = matchedData(req);
    const existedUser = await User.findOne({ email });

    if (existedUser) throw new ApiError(409, "User already exists");

    const user = await User.create({
        displayName: fullName,
        email,
        password
    });
    const createdUser = await User.findById(user._id).select("-password -refreshToken -googleId -createdAt -updatedAt");

    if (!createdUser) throw new ApiError(500, "Internal Server Error While registering");
    return res.status(201).json(new ApiResponse(201, createdUser, "User Registered Successfully"));
});
const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) throw new ApiError(400, "Email and password are required");

    const user = await User.findOne({ email });
    if (!user) throw new ApiError(404, "User not found");

    const isMatched = user.isPasswordCorrect(password);
    if (!isMatched) throw new ApiError(401, "Bad Credentials");

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken -googleId");

    res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, loggedInUser, "User LoggedIn Successfully"));


});
const generateAccessToken = asyncHandler(async (req, res) => {
    console.log("regenrating access token");
})
const getUserProfile = asyncHandler(async (req, res) => {
    cosole.log("get user profile");
})
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
    registerUser,
    login,
    logout,
    generateAccessToken,
    getUserProfile
}