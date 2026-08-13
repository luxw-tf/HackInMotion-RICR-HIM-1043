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

const candidateModels = [
  "claude-3-5-sonnet-20240620",
  "claude-3-sonnet-20240229",
  "claude-3-opus-20240229",
  "claude-3-5-sonnet-latest",
  "claude-3-haiku-latest",
  "claude-2.1"
];

async function check() {
  for (const m of candidateModels) {
    try {
      const res = await anthropic.messages.create({
        model: m,
        max_tokens: 10,
        messages: [{ role: "user", content: "Hi" }],
      });
      console.log(`[SUCCESS] Model '${m}' works! Response:`, res.content[0].text);
      return m;
    } catch (e) {
      console.log(`[FAILED] Model '${m}':`, e.message);
    }
  }
}

check();
