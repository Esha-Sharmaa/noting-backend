const { Router } = require("express");
const verifyJwt = require("../middleware/auth.middleware.js");
const {
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
} = require("../controllers/note.controller.js");
const upload = require("../middleware/multer.middleware.js");

const router = Router();

router.route("/").get(verifyJwt, getAllNotes);
router.route("/collab").get(verifyJwt, getCollabNotes);
router.route("/:id").get(verifyJwt, getNote);
//Todo: add the collaborator code
router.route("/add").post(verifyJwt, upload.single("noteImage"), addNote); //done
router.route("/edit/:id").put(verifyJwt, upload.single("noteImage"), editNote); //Todo: complete this controller
router.route("/delete/:id").delete(verifyJwt, deleteNote); // done
router.route("/labels/add").put(verifyJwt, addLabelToNote); // done
router
  .route("/labels/delete/:labelId/:noteId")
  .delete(verifyJwt, removeLabelFromNote); //done
router.route("/archive/:id").get(verifyJwt, archiveNote);
router.route("/unarchive/:id").get(verifyJwt, unarchiveNote);
router.route("/trash/:id").get(verifyJwt, trashNote);
router.route("/restore-trash/:id").get(verifyJwt, restoreTrashNote);
module.exports = router;
