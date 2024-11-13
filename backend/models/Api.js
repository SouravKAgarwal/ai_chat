import mongoose from "mongoose";

const apiRequestSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    prompt: { type: String, required: true },
    response: { type: String, required: true },
    status: { type: String, enum: ["success", "error"], required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const ApiRequest = mongoose.model("ApiRequest", apiRequestSchema);

export default ApiRequest;
