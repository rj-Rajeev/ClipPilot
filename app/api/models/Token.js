import mongoose from "mongoose";

const TokenSchema = new mongoose.Schema({
  state: String,
  userId: String,
  email: String,
  name: String,
  picture: String,

  access_token: String,
  refresh_token: String,
  scope: String,
  token_type: String,
  expiry_date: Number,
});

export default mongoose.models.Token ||
  mongoose.model("Token", TokenSchema);