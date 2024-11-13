import mongoose from "mongoose";

const savedPromptSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    prompt: { type: String, required: true },
    response: { type: String },
  },
  { timestamps: true }
);

const SavedPrompt = mongoose.model("SavedPrompt", savedPromptSchema);

export default SavedPrompt;
