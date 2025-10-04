// backend/test-gemini-key.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

console.log("Testing Gemini API Key...\n");

const apiKey = process.env.GEMINI_API_KEY;

// Check if key exists
if (!apiKey) {
  console.error("❌ GEMINI_API_KEY not found in .env");
  console.log("\nAdd this to backend/.env:");
  console.log("GEMINI_API_KEY=AIzaSy...");
  process.exit(1);
}

// Check key format
if (!apiKey.startsWith("AIza")) {
  console.error("❌ Invalid key format. Should start with 'AIza'");
  console.log("Current key:", apiKey.substring(0, 10) + "...");
  process.exit(1);
}

console.log(
  "✅ Key found:",
  apiKey.substring(0, 10) + "..." + apiKey.substring(apiKey.length - 5)
);

// Test API call
const test = async () => {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

    console.log("\nTesting API call...");
    const result = await model.generateContent("Say hello in 3 words");
    const response = await result.response;
    const text = response.text();

    console.log("✅ API Key is VALID!");
    console.log("Response:", text);
    console.log("\n🎉 Your Gemini API is working correctly!");
  } catch (error) {
    console.error("\n❌ API Key is INVALID!");
    console.error("Error:", error.message);
    console.log("\n📝 Steps to fix:");
    console.log("1. Go to: https://aistudio.google.com/app/apikey");
    console.log("2. Create a new API key");
    console.log("3. Copy the ENTIRE key (starts with AIza)");
    console.log("4. Update backend/.env: GEMINI_API_KEY=AIza...");
    console.log("5. Run this test again");
    process.exit(1);
  }
};

test();
