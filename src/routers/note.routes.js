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
} = require("../controllers/note.controller.js");
const upload = require("../middleware/multer.middleware.js");

const router = Router();

router.route("/").get(verifyJwt, getAllNotes); //Todo: add the collaborator code
router.route("/:id").get(verifyJwt, getNote); //Todo: add the collaborator code
router.route("/add").post(verifyJwt, upload.single("noteImage"), addNote); //done
router.route("/edit/:id").put(verifyJwt, editNote); //Todo: complete this controller
router.route("/delete/:id").delete(verifyJwt, deleteNote); // done
router.route("/labels/add").put(verifyJwt, addLabelToNote); // done
router.route("/labels/delete").delete(verifyJwt, removeLabelFromNote); //done

module.exports = router;
