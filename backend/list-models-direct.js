// backend/list-models-direct.js
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("❌ GEMINI_API_KEY not found in .env");
  process.exit(1);
}

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

const listModels = async () => {
  try {
    console.log("Making a direct API call to list models...");
    const response = await fetch(url);
    const data = await response.json();

    if (response.status !== 200) {
      console.error("\n❌ Error fetching models:", data.error.message);
      console.error("Please check your API key and try again.");
      process.exit(1);
    }

    console.log("\n✅ Successfully fetched available models.");

    let foundGeminiPro = false;
    let foundGeminiFlash = false;

    console.log("------------------------------------------");
    console.log("Supported Models for `generateContent`:");
    console.log("------------------------------------------");

    data.models.forEach((model) => {
      if (
        model.supportedGenerationMethods &&
        model.supportedGenerationMethods.includes("generateContent")
      ) {
        console.log(`- ${model.displayName} (${model.name})`);
        if (model.name.includes("gemini-pro")) {
          foundGeminiPro = true;
        }
        if (model.name.includes("gemini-1.5-flash")) {
          foundGeminiFlash = true;
        }
      }
    });

    console.log("------------------------------------------");
    if (foundGeminiPro) {
      console.log("✅ 'gemini-pro' is available. You can use this model.");
    } else {
      console.log("❌ 'gemini-pro' is NOT available with your key.");
    }
    if (foundGeminiFlash) {
      console.log(
        "✅ 'gemini-1.5-flash' is available. The full name should work."
      );
    } else {
      console.log("❌ 'gemini-1.5-flash' is NOT available with your key.");
    }

    console.log(
      "\n🎉 Based on the above list, you can now update your main script with a working model name."
    );
  } catch (error) {
    console.error("\n❌ An unexpected error occurred.");
    console.error("Error:", error);
  }
};

listModels();
