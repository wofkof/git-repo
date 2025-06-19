const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// 檢查是否在 git 專案中
try {
  execSync("git rev-parse --is-inside-work-tree", { stdio: "ignore" });
} catch {
  console.error("❌ 錯誤：請在 Git 專案目錄中執行！");
  process.exit(1);
}

// 建立 logs 資料夾（如果不存在）
const logDir = path.join(__dirname, "logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// 產生今天的日誌檔案
const today = new Date().toISOString().split("T")[0];
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
  execSync(`git add ${logFile}`, { stdio: "inherit" });
  execSync(`git commit -m "Auto log commit for ${today}"`, {
    stdio: "inherit",
  });
  execSync("git push origin main", { stdio: "inherit" });
  console.log("🚀 Push 成功");
} catch (err) {
  const errorMsg = err.stderr?.toString() || err.message;
  console.error("❌ Push 失敗：", errorMsg);

  if (errorMsg.includes("non-fast-forward")) {
    try {
      console.log("📥 嘗試先 pull --rebase 再 push...");
      execSync("git pull --rebase origin main", { stdio: "inherit" });
      execSync("git push origin main", { stdio: "inherit" });
      console.log("✅ Push 成功（透過 rebase）");
    } catch (pullErr) {
      console.error(
        "❌ 自動 pull/push 仍失敗：",
        pullErr.stderr?.toString() || pullErr.message
      );
    }
  }
}
