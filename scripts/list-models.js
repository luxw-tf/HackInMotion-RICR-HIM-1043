const fs = require("fs");
const path = require("path");
const Anthropic = require("@anthropic-ai/sdk");

const envPath = path.resolve(__dirname, "../.env");
let apiKey = "";
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const match = line.match(/^\s*ANTHROPIC_API_KEY\s*=\s*(.*)?\s*$/);
    if (match) {
      apiKey = match[1].replace(/['"]/g, "").trim();
    }
  });
}

const anthropic = new Anthropic({ apiKey });

async function list() {
  try {
    const page = await anthropic.models.list();
    console.log("Available models on your Anthropic account:", page.data.map(m => m.id));
  } catch (e) {
    console.log("List error:", e.message);
  }
}

list();
