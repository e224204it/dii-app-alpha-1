import { calculateNutrition } from "./nutritionMath.js"
import { exportToCSV, sendToGoogleSheet } from "./exportCSV.js";
import { calculateSufficiencyRate } from "./sufficiencyRate.js";

// 記録ボタン
document.getElementById("sendToSheet")?.addEventListener("click", async () => {
    await sendToGoogleSheet();
});


// localStorageから回答データを復元
const stored = localStorage.getItem("userSelections");
if (!stored) {
    document.getElementById("results-container").innerHTML = "<p>アンケート結果が見つかりません。</p>";
    throw new Error("userSelections not found");
}
const userSelections = JSON.parse(stored);

// グローバル変数としてnutritionMath.jsで使えるように設定
import { userSelections as sharedSelections } from "./generateForm.js";
Object.assign(sharedSelections, userSelections);

// 計算
(async () => {
    const { totals } = await calculateNutrition();

    // お茶の計算用
    const freqMap = { "毎日": 1, "週5-6": 5.5 / 7, "週2-4": 3 / 7, "週1": 1 / 7, "月1-3": 1 / 15, "無": 0 };
    function getFreq(foodName) {
        const f = userSelections[foodName]?.frequency;
        return freqMap[f] ?? 0;
    }

    const greenTeaFreq = getFreq("緑茶湯呑1杯");
    const blackTeaFreq = getFreq("紅茶カップ1杯");

    // 計算式： 緑茶 freq × 120/50 + 紅茶 freq × 150/50
    const specialValue = greenTeaFreq * (120 / 50) + blackTeaFreq * (150 / 50);

    // totalsへ追加
    totals["緑茶/紅茶 150ml/3g(g)"] = specialValue;

    // -------- 充足率の計算 --------
    const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
    const gender = userInfo.gender === "男性" ? "男性" : "女性";

    const sufficiency = await calculateSufficiencyRate(totals, gender);

    // 表の生成
    const container = document.getElementById("results-container");
    container.innerHTML = "<h2>栄養素の合計摂取量</h2>";

    const table = document.createElement("table");
    table.id = "result-table";

    const tbody = document.createElement("tbody");

    // ヘッダー行
    const thead = document.createElement("thead");
    thead.innerHTML = `
        <tr>
            <th>栄養素</th>
            <th>総量</th>
            <th>充足率</th>
        </tr>
    `;
    table.appendChild(thead);

    Object.entries(totals).forEach(([nut, value]) => {
        const rate = sufficiency[nut] ? sufficiency[nut].toFixed(1) + "%" : "-";
        const unit = nut.match(/\((.*?)\)/)?.[1] || "";  //単位の抽出
        const label = nut.replace(/\(.*?\)/, "");  //()の除去

        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${label}</td>
            <td>${value.toFixed(3)}${unit}</td>
            <td>${rate}</td>
        `;
        tbody.appendChild(row);
    });

    table.appendChild(tbody);
    container.appendChild(table);

    // 但し書き
    const note = document.createElement("p");
    note.className = "note-text";
    note.textContent = "※推奨または世界平均摂取量に対する充足率"
    document.body.appendChild(note);
})();

// ダウンロードボタン
const btn = document.getElementById("downloadCsvBtn");
if (btn) {
    btn.addEventListener("click", () => {
        exportToCSV();
    });
}

// test用
const data = JSON.parse(stored);

console.log("食品データ:", data);
console.log("選ばれた米の種類:", data.riceTypes);
