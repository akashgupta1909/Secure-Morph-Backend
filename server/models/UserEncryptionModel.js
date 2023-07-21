import mongoose from "mongoose";

const UserEncryption = new mongoose.Schema({
  privateKeySalt: {
    type: String,
    required: [true, "privateKeySalt is required"],
    unique: true,
  },
  encrytpedData: {
    type: String,
    required: [true, "encrytpedData is required"],
  },
  intializationVector: {
    type: String,
    required: [true, "intializationVector is required"],
  },
});

export default mongoose.model("UserEncryption", UserEncryption);
