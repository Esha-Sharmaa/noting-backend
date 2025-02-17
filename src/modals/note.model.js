const mongoose = require("mongoose");

const noteSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      trim: true,
      default: "",
    },
    type: {
      type: String,
      enum: ["text", "image", "list"],
      default: "text",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    label: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Label",
      },
    ],
    isPinned: {
      type: Boolean,
      default: false,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    isTrashed: {
      type: Boolean,
      default: false,
    },
    trashedAt: {
      type: Date,
    },
    notification: {
      type: Boolean,
    },
    reminder: {
      type: Date,
    },
    listItems: [
      {
        type: String,
      },
    ],
    imageUrl: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Note", noteSchema);
