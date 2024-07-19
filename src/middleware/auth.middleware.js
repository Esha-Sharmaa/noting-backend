const User = require("../modals/user.modal");
const ApiError = require("../utils/ApiError");
const jwt = require("jsonwebtoken");

const verifyJwt = async (req, _, next) => {
  try {
    const token =
      req?.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) throw new ApiError(403, "Unauthorized Access");

    const decodedTokenInfo = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET_KEY
    );

    const user = await User.findById(decodedTokenInfo?._id).select(
      "-password -refreshToken -googleId"
    );

    if (!user) throw new ApiError(403, "Invalid Access Token");

    req.user = user;
    next();
  } catch (error) {
    next(
      new ApiError(
        error.statusCode || 403,
        error.message || "Invalid Access Token"
      )
    );
  }
};

module.exports = verifyJwt;
