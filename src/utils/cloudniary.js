const cloudinary = require("cloudinary").v2;
const ApiError = require("../utils/ApiError.js");
const fs = require("fs");
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    const uploadResult = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      timeout: 60000,
    });
    console.log("file uploaded successfully");
    fs.unlinkSync(localFilePath);
    return uploadResult.url;
  } catch (error) {
    console.log("Error uploading the file on cloudinary", error);
    fs.unlinkSync(localFilePath);
    return null;
  }
};

module.exports = {
  uploadOnCloudinary,
};
