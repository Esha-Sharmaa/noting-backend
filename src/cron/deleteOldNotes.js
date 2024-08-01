const cron = require("node-cron");
const Note = require("../modals/note.model.js");
const Collaborator = require("../modals/collaborator.model.js");
const asyncHandler = require("../utils/asyncHandler.js");

const deleteOldNotes = async () => {
  const tenDaysAgo = new Date();
  tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

  const oldNotes = await Note.find({ trashedAt: { $lt: tenDaysAgo } });

  oldNotes.forEach(async (note) => {
    await Collaborator.deleteMany({ note: note._id });
    await Note.findByIdAndDelete(id);
  });
};

cron.schedule(
  "0 0 * * *",
  asyncHandler(async () => {
    try {
      await deleteOldNotes();
    } catch (error) {
      console.log("ERROR IN CRON JOB: ", error);
    }
  })
);
