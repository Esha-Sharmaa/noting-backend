const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError.js");
const ApiResponse = require("../utils/ApiResponse.js");
const Label = require("../modals/label.model.js");
const { matchedData, validationResult } = require("express-validator");

const createLabel = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) throw new ApiError(401, "validation errros");

  const { name } = matchedData(req);

  const label = await Label.create({
    user: req.user._id,
    name,
  });

  if (!label) throw new ApiError(500, "Error while creating label");
  return res
    .status(201)
    .json(new ApiResponse(201, label, "Label created successfully"));
});
const deleteLabel = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id) throw new ApiError(400, "Label Id is required");

  const label = await Label.findByIdAndDelete(id);
  if (!label) throw new ApiError(404, "Label not found");

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Label deleted successfully"));
});
module.exports = {
  createLabel,
  deleteLabel,
};
