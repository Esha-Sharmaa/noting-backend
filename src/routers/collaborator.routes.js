const { Router } = require("express");
const verifyJwt = require("../middleware/auth.middleware.js");
const validateAddCollaborator = require("../validations/validateAddCollaborator.js");
const {
  addCollborator,
  removeCollborator,
} = require("../controllers/collaborator.controller.js");
const router = Router();

router.route("/add").post(verifyJwt, validateAddCollaborator, addCollborator);
router.route("/delete/:id").delete(verifyJwt, removeCollborator);
module.exports = router;
