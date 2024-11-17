import mongoose from "mongoose";

const imageInfo = new mongoose.Schema({
  imageUrl: { type: String },
  fileData: {
    destination: { type: String },
    encoding: { type: String },
    fieldname: { type: String },
    filename: { type: String },
    mimetype: { type: String },
    originalname: { type: String },
    path: { type: String },
    size: { type: Number },
  },
});

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: String,
      enum: ["human", "ai"],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    usageMetaData: {
      promptTokenCount: { type: Number },
      candidatesTokenCount: { type: Number },
      totalTokenCount: { type: Number },
    },
    image: imageInfo,
    refreshedResponses: [
      {
        message: { type: String, required: true },
        refreshedResponses: [
          {
            message: { type: String, required: true },
            usageMetaData: {
              promptTokenCount: { type: Number },
              candidatesTokenCount: { type: Number },
              totalTokenCount: { type: Number },
            },
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

const chatSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true },
    conversation: [messageSchema],
    proxyChatId: { type: String, unique: true, sparse: true },
  },
  { timestamps: true }
);

const Chat = mongoose.model("Chat", chatSchema);
export default Chat;
