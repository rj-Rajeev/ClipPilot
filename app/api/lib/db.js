import { connectDB } from "./mongoose";
import Token from "../models/Token";

export async function saveTokens(state, data) {
  await connectDB();

  await Token.findOneAndUpdate(
    { state },
    {
      state,
      ...data,
    },
    {
      upsert: true,
      new: true,
    }
  );
}

export async function getTokens(state) {
  await connectDB();

  const doc = await Token.findOne({ state }).lean();

  return doc || null;
}