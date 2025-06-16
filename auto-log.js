const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// 建立 logs 資料夾（如果不存在）
const logDir = path.join(__dirname, "logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// 產生今天的日誌檔案
const today = new Date().toISOString().split("T")[0]; // 2025-06-17
const logFile = path.join(logDir, `${today}.md`);
const content = `# 日誌 - ${today}\n\n- 自動產生的日誌內容。`;

if (!fs.existsSync(logFile)) {
  fs.writeFileSync(logFile, content);
  console.log(`✅ 建立新日誌：${logFile}`);
} else {
  console.log(`⚠️ 今日日誌已存在：${logFile}`);
}

// 自動 Git 操作
try {
  execSync("git add .");
  execSync(`git commit -m "Auto log commit for ${today}"`);
  execSync("git push origin main");
  console.log("🚀 Push 成功");
} catch (err) {
  console.error("❌ Push 失敗：", err.message);
}
