const mongoose = require("mongoose");

const algorithmSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    githubUrl: {
      type: String,
      required: true,
      trim: true,
    },
    filename: {
      type: String,
      required: true,
      trim: true,
    },
    className: {
      type: String,
      trim: true,
      default: "",
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    methods: {
      type: [String],
      default: [],
    },
    code: {
      type: String,
      required: true,
    },
    lineCount: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    folderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AlgorithmFolder",
      default: null,
    },
    slug: {
      type: String,
      trim: true,
      lowercase: true,
    },
  },
  { timestamps: true },
);

function slugify(input) {
  return (
    String(input || "")
      .replace(/\.java$/i, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "algorithm"
  );
}

algorithmSchema.statics.slugify = slugify;

algorithmSchema.statics.uniqueSlug = async function uniqueSlug(base, excludeId) {
  const Algorithm = this;
  let slug = base;
  let n = 2;
  while (await Algorithm.exists({
    slug,
    ...(excludeId ? { _id: { $ne: excludeId } } : {}),
  })) {
    slug = `${base}-${n++}`;
  }
  return slug;
};

algorithmSchema.pre("save", async function assignSlug() {
  if (this.slug) return;
  const base = slugify(this.filename || this.className || this.title);
  this.slug = await this.constructor.uniqueSlug(base, this._id);
});

algorithmSchema.index({ slug: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("Algorithm", algorithmSchema);
