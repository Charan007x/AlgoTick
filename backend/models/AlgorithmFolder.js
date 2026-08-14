const mongoose = require("mongoose");

const algorithmFolderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AlgorithmFolder",
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

algorithmFolderSchema.index({ parentId: 1, name: 1 });

module.exports = mongoose.model("AlgorithmFolder", algorithmFolderSchema);
