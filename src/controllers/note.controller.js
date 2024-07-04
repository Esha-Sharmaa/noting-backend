const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError.js");
const ApiResponse = require("../utils/ApiResponse.js");
const Note = require("../modals/note.model.js");
const Label = require("../modals/label.model.js");
const Collaborator = require("../modals/collaborator.model.js");
const { uploadOnCloudinary } = require("../utils/cloudniary.js");
const mongoose = require("mongoose");

//completed
const addNote = asyncHandler(async (req, res) => {
  if (!req.user || !req.user._id)
    throw new ApiError(401, "User not authenticated");

  const { title, content, type, listItems } = req.body;
  const noteImageLocalpath = req?.file?.path;

  let imageUrl = null;
  if (noteImageLocalpath) {
    imageUrl = await uploadOnCloudinary(noteImageLocalpath);
  }

  if (!title || !type) throw new ApiError(400, "Title and type are required");

  const newNote = await Note.create({
    title,
    content: content || null,
    type,
    user: req.user._id,
    imageUrl: type === "image" ? imageUrl : null,
    listItems: type === "list" ? JSON.parse(listItems) : [],
  });

  if (!newNote) throw new ApiError(500, "Error creating note");

  return res
    .status(201)
    .json(new ApiResponse(201, newNote, "Note added successfully"));
});

const getNote = asyncHandler(async (req, res) => {
  if (!req.user || !req.user._id)
    throw new ApiError(401, "User not authenticated");
  const { id } = req.params;
  if (!id) throw new ApiError(400, "Note id is required");

  const note = await Note.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(id) },
    },
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $unwind: "$user",
    },
    {
      $project: {
        "user.password": 0,
        "user.__v": 0,
        "user.refreshToken": 0,
      },
    },
    {
      $lookup: {
        from: "labels",
        localField: "label",
        foreignField: "_id",
        as: "label",
      },
    },
    {
      $lookup: {
        from: "collaborators",
        let: { noteId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$note", "$$noteId"] },
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "user",
              foreignField: "_id",
              as: "user",
            },
          },
          { $unwind: "$user" },
          {
            $project: {
              "user.password": 0, // Exclude password field
              "user.__v": 0, // Exclude __v field
              "user.refreshToken": 0, // Exclude refreshToken field
            },
          },
        ],
        as: "collaborators",
      },
    },
  ]);
  if (!note) throw new ApiError(404, "Note not found");

  res.status(200).json(new ApiResponse(200, note, "Note fetched successfully"));
});

const getAllNotes = asyncHandler(async (req, res) => {
  if (!req.user || !req.user._id)
    throw new ApiError(401, "User not authenticated");

  const notes = await Note.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $unwind: "$user",
    },
    {
      $project: {
        "user.password": 0,
        "user.__v": 0,
        "user.refreshToken": 0,
      },
    },
    {
      $lookup: {
        from: "labels",
        localField: "label",
        foreignField: "_id",
        as: "label",
      },
    },
    {
      $lookup: {
        from: "collaborators",
        let: { noteId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$note", "$$noteId"] },
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "user",
              foreignField: "_id",
              as: "user",
            },
          },
          { $unwind: "$user" },
          {
            $project: {
              "user.password": 0, // Exclude password field
              "user.__v": 0, // Exclude __v field
              "user.refreshToken": 0, // Exclude refreshToken field
            },
          },
        ],
        as: "collaborators",
      },
    },
  ]);
  if (!notes) throw new ApiError(404, "Notes not found");

  return res
    .status(200)
    .json(new ApiResponse(200, notes, "Notes fetched successfully"));
});

const editNote = asyncHandler(async (req, res) => {
  console.log("edit a note");
});

const deleteNote = asyncHandler(async (req, res) => {
  if (!req.user || !req.user._id)
    throw new ApiError(401, "User not authenticated");

  const { id } = req.params;
  if (!id) throw new ApiError(400, "Note id is required");

  const note = await findOne({ _id: id, user: req.user._id });
  if (!note)
    throw new ApiError(
      404,
      "Not not found or you don't have the permission to delete the note"
    );

  await Collaborator.deleteMany({ note: id });
  await Note.findByIdAndDelete(id);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Note deleted successfully"));
});

const addLabelToNote = asyncHandler(async (req, res) => {
  if (!req.user || !req.user._id)
    throw new ApiError(401, "User not authenticated");

  const { labelId, noteId } = req.body;
  if (!labelId || !noteId)
    throw new ApiError(400, "LableID and NoteID both are required");

  const label = await Label.findById(labelId);
  if (!label) throw new ApiError(404, "Label not found");

  if (label.user.toString() !== req.user._id.toString())
    throw new ApiError(401, "You do not have permission to use this label");

  const note = await Note.findOneAndUpdate(
    { _id: noteId, user: req.user._id },
    {
      $push: { label: labelId },
    },
    { new: true }
  );

  if (!note) throw new ApiError("Note not found");

  return res
    .status(200)
    .json(new ApiResponse(200, note, "Label added successfully"));
});

const removeLabelFromNote = asyncHandler(async (req, res) => {
  if (!req.user || !req.user._id)
    throw new ApiError(401, "User not authenticated");

  const { labelId, noteId } = req.body;
  if (!labelId || !noteId)
    throw new ApiError(400, "LableID and NoteID both are required");

  const label = await Label.findById(labelId);
  if (!label) throw new ApiError(404, "Label not found");

  if (label.user.toString() !== req.user._id.toString())
    throw new ApiError(401, "You do not have permission to use this label");

  const note = await Note.findOneAndUpdate(
    { _id: noteId, user: req.user._id },
    {
      $pull: { label: labelId },
    },
    { new: true }
  );

  if (!note) throw new ApiError("Note not found");

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Label removed successfully"));
});
module.exports = {
  addNote,
  getNote,
  getAllNotes,
  editNote,
  deleteNote,
  addLabelToNote,
  removeLabelFromNote,
};
