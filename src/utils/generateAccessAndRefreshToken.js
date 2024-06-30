const User = require("../modals/user.modal.js");
const ApiError = require('../utils/ApiError.js');


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

module.exports = generateAccessAndRefreshToken;