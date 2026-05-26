var express = require("express");
var cors = require("cors");
var app = express();

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
const pdfTableExtractor = require('pdf-table-extractor');
var fs = require("fs");
const path = require('path');
const pdfParse = require('pdf-parse');
app.listen(3000);
console.log("Web伺服器就緒，開始接受用戶端連線.");
console.log("「Ctrl + C」可結束伺服器程式.");

pdfTableExtractor(path.join(__dirname, "./114.pdf"), function (result) {
    let taxList = [];
    let currentSubCategory = "未分類"; // 預設值
    let pages = result.pageTables
    for (let p = 0; p < pages.length; p++) {
        let rows = result.pageTables[p].tables;

        for (let i = 1; i < rows.length; i++) {
            let currentRow = rows[i];
            let cleanCells = currentRow
                .map(c => c ? c.toString().trim() : "")
                .filter(c => c !== "");
            if (cleanCells.length === 0) continue;
            if (/^[A-ZＡ-Ｚ]\./.test(cleanCells[0])) {
                continue;
            }
            let firstCell = cleanCells[0];
            let match = firstCell.match(/(\d{4}--\d{2})/);
            if (match && firstCell.length > 9) {
                let code = match[0];
                let name = firstCell.replace(code, "").trim();
                cleanCells = [code, name, ...cleanCells.slice(1)];
            }
            if (match) {
                taxList.push({
                    "所屬小業別": currentSubCategory,
                    "標準代號": cleanCells[0],
                    "行業名稱": cleanCells[1],
                    "擴大書審純益率":Number(cleanCells[2]),
                    "所得額標準": Number(cleanCells[3]),
                    "毛利率": Number(cleanCells[4]),
                    "費用率": Number(cleanCells[5]),
                    "淨利率": Number(cleanCells[6])
                });
            } else {
                // 如果沒代號，且不是 A. 分類，那這行很可能是「小分類標題」
                currentSubCategory = cleanCells[0];
            }
        }








    }
    var taxJS=JSON.stringify(taxList,null,"\t")
    fs.writeFileSync("data.JSON",taxJS)


})







