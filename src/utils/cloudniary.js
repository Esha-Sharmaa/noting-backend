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
    console.log("File uploaded successfully");
    fs.unlinkSync(localFilePath);
    return uploadResult.url;
  } catch (error) {
    console.log("Error uploading the file on Cloudinary", error);
    fs.unlinkSync(localFilePath);
    throw new ApiError(500, "Error uploading on Cloudinary");
  }
};

const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) throw new ApiError(400, "Public ID is required");
    await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
    console.log("File deleted successfully from Cloudinary");
  } catch (error) {
    console.log("Error deleting the file from Cloudinary", error);
    throw new ApiError(500, "Error deleting from Cloudinary");
  }
};

module.exports = {
  uploadOnCloudinary,
  deleteFromCloudinary,
};
