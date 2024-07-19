const { validationResult, matchedData } = require("express-validator");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const User = require("../modals/user.modal");
const ApiResponse = require("../utils/ApiResponse");
const generateAccessAndRefreshToken = require("../utils/generateAccessAndRefreshToken.js");
const jwt = require("jsonwebtoken");
const {
  uploadOnCloudinary,
  deleteFromCloudinary,
} = require("../utils/cloudniary.js");
const options = {
  httpOnly: true,
  secure: true,
  sameSite: "None",
};

const registerUser = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let errobj = {};
    errors.errors.forEach((err) => {
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
    password,
  });
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken -googleId -createdAt -updatedAt"
  );

  if (!createdUser)
    throw new ApiError(500, "Internal Server Error While registering");
  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User Registered Successfully"));
});
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    throw new ApiError(400, "Email and password are required");

  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, "User not found");

  const isMatched = await user.isPasswordCorrect(password);

  if (!isMatched) throw new ApiError(401, "Bad Credentials");

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken -googleId"
  );

  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, loggedInUser, "User LoggedIn Successfully"));
});
const refreshAccessToken = asyncHandler(async (req, res) => {
  const token =
    req?.cookies?.refreshToken ||
    req?.body?.refreshToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) throw new ApiError(401, "Unauthorized Access");

  const decodedTokenInfo = jwt.verify(
    token,
    process.env.REFRESH_TOKEN_SECRET_KEY
  );

  const user = await User.findById(decodedTokenInfo?._id);

  if (!user) throw new ApiError(401, "Invalid Refresh Token");
  if (token !== user.refreshToken)
    throw new ApiError(401, "Refresh Token is expired or used");

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { accessToken, refreshToken },
        "AccessToken generated successfully"
      )
    );
});

const getUserProfile = asyncHandler(async (req, res) => {
  res
    .status(200)
    .json(new ApiResponse(200, req.user, "User Info fetched successfully"));
});

const logout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out Successfully"));
});
const changeAvatar = asyncHandler(async (req, res) => {
  if (!req.user || !req.user._id) throw new ApiError(401, "Unauthorized user");

  const user = await User.findById(req.user._id);
  if (!user) throw new ApiError(404, "User not found");

  const avatarLocalPath = req?.file?.path;
  if (!avatarLocalPath) throw new ApiError(400, "Avatar image is required");

  if (user.avatar) {
    const publicId = user.avatar.split("/").pop().split(".")[0];
    await deleteFromCloudinary(publicId);
  }
  const avatarUrl = await uploadOnCloudinary(avatarLocalPath);

  user.avatar = avatarUrl;
  await user.save();

  const updatedUser = await User.findById(req.user._id).select(
    "-password -refreshToken -googleId"
  );

  if (!avatarUrl) throw new ApiError(500, "Error uploading avatar");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "Avatar updated successfully"));
});
const deleteAvatar = asyncHandler(async (req, res) => {
  if (!req.user || !req.user._id) throw new ApiError(401, "Unauthorized user");

  const user = await User.findById(req.user._id);
  if (!user) throw new ApiError(404, "User not found");

  if (user.avatar) {
    const publicId = user.avatar.split("/").pop().split(".")[0];
    await deleteFromCloudinary(publicId);
  }
  user.avatar = null;
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Avatar deleted successfully"));
});
module.exports = {
  registerUser,
  login,
  logout,
  refreshAccessToken,
  getUserProfile,
  changeAvatar,
  deleteAvatar,
};
