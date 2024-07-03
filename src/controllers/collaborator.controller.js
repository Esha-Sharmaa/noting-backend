const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError.js");
const ApiResponse = require("../utils/ApiResponse.js");
const User = require("../modals/user.modal.js");
const Note = require("../modals/note.model.js");
const Collaborator = require("../modals/collaborator.model.js");

const addCollborator = asyncHandler(async (req, res) => {
  if (!req.user || !req.user._id)
    throw new ApiError(403, "User not authenticated");

  const { email, noteId, permission } = req.body;
  if (!email || !noteId || !permission)
    throw new ApiError(404, "Email noteid and permission all are required");

  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, "User not found");

  // checking if the note with the given note id exists and the owner is the logged in user
  const note = await Note.findById(noteId);
  if (!note) throw new ApiError(404, "Note not found");

  if (!note.user.equals(req.user._id))
    throw new ApiError(403, "You do not have permission to add collaborator");

  const existingCollaborator = await Collaborator.findOne({
    user: user._id,
    note: noteId,
  });

  if (existingCollaborator)
    throw new ApiError(400, "User is already a collaborator on this note");

  const collaborator = await Collaborator.create({
    user: user._id,
    note: noteId,
    permission,
  });

  if (!collaborator) throw new ApiError(500, "Error while adding collaborator");
  return res
    .status(201)
    .json(
      new ApiResponse(201, collaborator, "Collaborator added successfully")
    );
});

const removeCollborator = asyncHandler(async (req, res) => {
  if (!req.user || !req.user._id)
    throw new ApiError(403, "User not authenticated");

  const { id } = req.params;
  if (!id) throw new ApiError(400, "Collaborator Id is required");

  const collaborator = await Collaborator.findById(id);
  if (!collaborator) throw new ApiError(404, "Collaborator not found");

  const note = await Note.findById(collaborator.note);
  if (!note) throw new ApiError(404, "note not found");

  if (!note.user.equals(req.user._id))
    throw new ApiError(403, "You Don't have permission to remove collaborator");

  await Collaborator.findByIdAndDelete(id);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Collaborator added Successfully"));
});
module.exports = {
  addCollborator,
  removeCollborator,
};
