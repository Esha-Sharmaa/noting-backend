const { Router } = require("express");
const verifyJwt = require("../middleware/auth.middleware.js");
const validateLabelName = require("../validations/validateLabelName.js");
const {
  createLabel,
  deleteLabel,
} = require("../controllers/label.controller.js");

const router = Router();

router.route("/create-label").post(verifyJwt, validateLabelName, createLabel);
router.route("/delete-label/:id").delete(verifyJwt, deleteLabel);

module.exports = router;
