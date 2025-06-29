import { Schema, model } from "mongoose";

const chatSchema = new Schema({
  senderId: { type: Schema.Types.ObjectId, ref: "user", required: true },
  userName: { type: String, required: true },
  receiverId: { type: Schema.Types.ObjectId, ref: "user", required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const chatModel = model("Chat", chatSchema);
export default chatModel;
