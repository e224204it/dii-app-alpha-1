import { calculateNutrition } from "./nutritionMath.js"
import { exportToCSV, sendToGoogleSheet } from "./exportCSV.js";

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

    const container = document.getElementById("results-container");
    const table = document.createElement("table");
    table.id = "result-table";

    const tbody = document.createElement("tbody");

    Object.entries(totals).forEach(([nut, value]) => {
        const row = document.createElement("tr");
        const unit = nut.match(/\((.*?)\)/)?.[1] || "";  //単位の抽出
        const label = nut.replace(/\(.*?\)/, "");  //()の除去

        row.innerHTML = `
            <td>${label}</td>
            <td>${value.toFixed(3)}${unit}</td>
        `;
        tbody.appendChild(row);
    });

    table.appendChild(tbody);
    container.innerHTML = "<h2>栄養素の合計摂取量</h2>";
    container.appendChild(table);
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
