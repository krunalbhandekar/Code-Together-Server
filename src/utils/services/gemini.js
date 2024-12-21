import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import Status from "../enums/status.js";

dotenv.config();

const getGeminiResponse = async ({ prompt }) => {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const GeminiModel = genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL,
  });

  try {
    const res = await GeminiModel.generateContent(prompt);
    return { status: Status.SUCCESS, response: res.response.text() };
  } catch (err) {
    return { status: Status.ERROR, error: "Internal server error" };
  }
};

export default getGeminiResponse;
