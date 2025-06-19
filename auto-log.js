const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// 確保是在 Git 專案中
try {
  execSync("git rev-parse --is-inside-work-tree", { stdio: "ignore" });
} catch {
  console.error("❌ 錯誤：請在 Git 專案目錄中執行！");
  process.exit(1);
}

// logs 資料夾
const logDir = path.join(__dirname, "logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// 產生/覆蓋 今日的 md 檔
const today = new Date().toISOString().split("T")[0];
const logFile = path.join(logDir, `${today}.md`);
const content = `# 日誌 - ${today}\n\n- 登入時間：${new Date().toLocaleString()}\n`;

fs.writeFileSync(logFile, content);
console.log(`✅ 已產生今日 md：${logFile}`);

// Git 操作（強制 commit 一次）
try {
  execSync(`git add ${logFile}`, { stdio: "inherit" });
  execSync(`git commit -m "Auto log for ${today}"`, { stdio: "inherit" });
  execSync("git push origin main", { stdio: "inherit" });
  console.log("🚀 Push 成功");
} catch (err) {
  const msg = err.stderr?.toString() || err.message;
  console.error("❌ Push 失敗：", msg);

  if (msg.includes("non-fast-forward")) {
    try {
      console.log("📥 嘗試 pull --rebase 再 push...");
      execSync("git pull --rebase origin main", { stdio: "inherit" });
      execSync("git push origin main", { stdio: "inherit" });
      console.log("✅ Push 成功（rebase 後）");
    } catch (pullErr) {
      console.error("❌ Pull 後仍失敗：", pullErr.stderr?.toString() || pullErr.message);
    }
  }
}
