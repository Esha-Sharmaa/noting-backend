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

  if (!title || !type) throw new ApiError(400, "Title and type are required");
  const noteImageLocalpath = req?.file?.path;

  let imageUrl = null;
  if (noteImageLocalpath) {
    imageUrl = await uploadOnCloudinary(noteImageLocalpath);
  }

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
    {
      $sort: {
        isPinned: -1,
      },
    },
  ]);
  if (!notes) throw new ApiError(404, "Notes not found");

  return res
    .status(200)
    .json(new ApiResponse(200, notes, "Notes fetched successfully"));
});

const editNote = asyncHandler(async (req, res) => {
  if (!req.user || !req.user._id)
    throw new ApiError(401, "User not authenticated");

  const { id } = req.params;
  const { title, content, listItems, type } = req.body;


  if (!id) throw new ApiError(400, "Note id is required");
  if (!title || !type) throw new ApiError(400, "Title and type are required"); // Validate type as well

  const noteImageLocalpath = req?.file?.path;



  let imageUrl = null;
  if (noteImageLocalpath) {
    try {
      imageUrl = await uploadOnCloudinary(noteImageLocalpath);
    } catch (error) {
      console.error("Error uploading image to Cloudinary:", error);
      throw new ApiError(500, "Error uploading image to Cloudinary");
    }
  }

  const updatedNote = await Note.findByIdAndUpdate(id, {
    $set: {
      title,
      content: content || null,
      user: req.user._id,
      imageUrl: type === "image" ? imageUrl : null,
      listItems: type === "list" ? JSON.parse(listItems) : [],
    },
  });

  if (!updatedNote) throw new ApiError(500, "Error updating note");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedNote, "Note updated successfully"));
});

const deleteNote = asyncHandler(async (req, res) => {
  if (!req.user || !req.user._id)
    throw new ApiError(401, "User not authenticated");

  const { id } = req.params;
  if (!id) throw new ApiError(400, "Note id is required");

  const note = await Note.findOne({ _id: id, user: req.user._id });

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

  const { labelId, noteId } = req.params;

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
const archiveNote = asyncHandler(async (req, res) => {
  if (!req.user || !req.user._id)
    throw new ApiError(401, "User not authenticated");
  const { id } = req.params;
  if (!id) throw new ApiError(400, "Note id is required");

  const note = await Note.findById(id);
  if (!note) throw new ApiError(404, "Note not found");

  note.isArchived = true;
  await note.save();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Note Archived successfully"));
});
const unarchiveNote = asyncHandler(async (req, res) => {
  if (!req.user || !req.user._id)
    throw new ApiError(401, "User not authenticated");
  const { id } = req.params;
  if (!id) throw new ApiError(400, "Note id is required");

  const note = await Note.findById(id);
  if (!note) throw new ApiError(404, "Note not found");

  note.isArchived = false;
  await note.save();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Note Unarchived successfully"));
});

const trashNote = asyncHandler(async (req, res) => {
  if (!req.user || !req.user._id)
    throw new ApiError(401, "User not authenticated");
  const { id } = req.params;
  if (!id) throw new ApiError(400, "Note id is required");

  const note = await Note.findById(id);
  if (!note) throw new ApiError(404, "Note not found");

  note.isTrashed = true;
  note.trashedAt = new Date().getDate();
  await note.save();
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Note Trashed successfully"));
});
const restoreTrashNote = asyncHandler(async (req, res) => {
  if (!req.user || !req.user._id)
    throw new ApiError(401, "User not authenticated");
  const { id } = req.params;
  if (!id) throw new ApiError(400, "Note id is required");

  const note = await Note.findById(id);
  if (!note) throw new ApiError(404, "Note not found");

  note.isTrashed = false;
  note.trashedAt = null;
  await note.save();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Note Trashed successfully"));
});

const getCollabNotes = asyncHandler(async (req, res) => {
  if (!req.user || !req.user._id)
    throw new ApiError(401, "User not authenticated");

  const collabNote = await Collaborator.aggregate([
    {
      $match: { user: req.user._id },
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
      $lookup: {
        from: "notes",
        localField: "note",
        foreignField: "_id",
        as: "note",
      },
    },
    {
      $unwind: "$note",
    },
    {
      $lookup: {
        from: "labels",
        let: { labelIds: "$note.label" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $in: ["$_id", "$$labelIds"] }, // Label ID must be in note's label array
                  { $eq: ["$user", req.user._id] }, // Label's user must be the current user
                ],
              },
            },
          },
        ],
        as: "note.labels",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "note.user",
        foreignField: "_id",
        as: "note.userDetails",
      },
    },
    {
      $unwind: {
        path: "$note.userDetails",
        preserveNullAndEmptyArrays: true, // This will keep notes without matching users
      },
    },
    {
      $project: {
        "note._id": 1,
        "note.title": 1,
        "note.content": 1,
        "note.type": 1,
        "note.userDetails.displayName": 1,
        "note.userDetails.email": 1,
        "note.userDetails.avatar": 1,
        "note.labels": 1,

        "note.listItems": 1,
        "note.imageUrl": 1,
        "note.createdAt": 1,
        "note.updatedAt": 1,

        "user.displayName": 1,
        "user.email": 1,
        "user.avatar": 1,
        permission: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ]);

  if (!collabNote) throw new ApiError(404, "Note not found");
  return res
    .status(200)
    .json(new ApiResponse(200, collabNote, "Notes fetched successfully"));
});

const pinNote = asyncHandler(async (req, res) => {
  if (!req.user || !req.user._id)
    throw new ApiError(401, "User not authenticated");
  const { id } = req.params;
  if (!id) throw new ApiError(400, "Note id is required");

  const note = await Note.findById(id);
  if (!note) throw new ApiError(404, "Note not found");

  note.isPinned = true;
  await note.save();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Note Pinned successfully"));
});
const unpinNote = asyncHandler(async (req, res) => {
  if (!req.user || !req.user._id)
    throw new ApiError(401, "User not authenticated");
  const { id } = req.params;
  if (!id) throw new ApiError(400, "Note id is required");

  const note = await Note.findById(id);
  if (!note) throw new ApiError(404, "Note not found");

  note.isPinned = false;
  await note.save();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Note Pinned successfully"));
});
module.exports = {
  addNote,
  getNote,
  getAllNotes,
  editNote,
  deleteNote,
  addLabelToNote,
  removeLabelFromNote,
  archiveNote,
  unarchiveNote,
  trashNote,
  restoreTrashNote,
  getCollabNotes,
  pinNote,
  unpinNote,
};
