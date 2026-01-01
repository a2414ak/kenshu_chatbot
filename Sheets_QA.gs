/************************************************
 * QA読み込み
 * 通常: A-D 列（category/question/answer/keywords）
 * 例外: 1列(A)にCSV形式で格納されている場合も対応
 ************************************************/
function loadQA_(opts) {
  const debug = !!(opts && opts.debug);

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) throw new Error("QAシートが見つかりません: " + SHEET_NAME);

  const lastRow = Math.min(sheet.getLastRow(), MAX_ROWS);
  const lastCol = sheet.getLastColumn();

  if (debug) {
    Logger.log(`[loadQA_] spreadsheet="${ss.getName()}" sheet="${SHEET_NAME}" lastRow=${sheet.getLastRow()} cappedLastRow=${lastRow} lastCol=${lastCol}`);
  }

  if (lastRow < 2) {
    if (debug) Logger.log("[loadQA_] データ行がありません（2行目以降が存在しない）");
    return [];
  }

  // ---------- CSV 1列モード判定 ----------
  // lastCol=1 かつ ヘッダーがカンマを含む → 1セルCSVとみなす
  const headerCell = String(sheet.getRange(1, 1).getValue() ?? "");
  const isCsvSingleColumn = (lastCol === 1) && headerCell.includes(",");

  if (isCsvSingleColumn) {
    if (debug) {
      Logger.log(`[loadQA_] CSV single-column mode detected. headerCell="${headerCell}"`);
    }

    // ヘッダーをCSVとして解析
    const header = Utilities.parseCsv(headerCell)[0].map(h => String(h).trim());
    const idx = {
      category: header.indexOf("category"),
      question: header.indexOf("question"),
      answer: header.indexOf("answer"),
      keywords: header.indexOf("keywords"),
    };

    if (debug) Logger.log(`[loadQA_] parsed header=${JSON.stringify(header)} idx=${JSON.stringify(idx)}`);

    // 必須列がなければエラー
    if (idx.question < 0 || idx.answer < 0) {
      throw new Error(`CSVヘッダーに必要列がありません。header=${JSON.stringify(header)}`);
    }

    // A列の各行をCSVとして解析
    const raw = sheet.getRange(2, 1, lastRow - 1, 1).getValues().flat();
    const rows = raw
      .map(v => String(v ?? "").trim())
      .filter(line => line.length > 0)
      .map(line => Utilities.parseCsv(line)[0]);

    if (debug) {
      Logger.log(`[loadQA_] csv rows=${rows.length}`);
      Logger.log(`[loadQA_] sample rows(先頭5件)=${JSON.stringify(rows.slice(0, 5))}`);
    }

    const list = rows
      .map(r => ({
        category: (idx.category >= 0 ? String(r[idx.category] ?? "").trim() : ""),
        question: String(r[idx.question] ?? "").trim(),
        answer: String(r[idx.answer] ?? "").trim(),
        keywords: (idx.keywords >= 0 ? String(r[idx.keywords] ?? "").trim() : ""),
      }))
      .filter(r => r.question && r.answer);

    if (debug) Logger.log(`[loadQA_] filtered qaList.length=${list.length}`);
    return list;
  }

  // ---------- 通常（A-D列）モード ----------
  if (debug) {
    const header = sheet.getRange(1, 1, 1, Math.min(10, lastCol)).getValues()[0];
    Logger.log(`[loadQA_] header(1行目,先頭10列まで)=${JSON.stringify(header)}`);
  }

  const values = sheet.getRange(2, 1, lastRow - 1, 4).getValues();

  if (debug) {
    Logger.log(`[loadQA_] raw values rows=${values.length} cols=4 (A-D)`);
    const nonEmptyCounts = [0, 0, 0, 0];
    for (const r of values) {
      for (let i = 0; i < 4; i++) {
        const v = String(r[i] ?? "").trim();
        if (v) nonEmptyCounts[i]++;
      }
    }
    Logger.log(`[loadQA_] non-empty counts A-D = ${JSON.stringify(nonEmptyCounts)} (A:category B:question C:answer D:keywords)`);
  }

  const list = values
    .map(r => {
      const category = String(r[0] ?? "").trim();
      const question  = String(r[1] ?? "").trim();
      const answer    = String(r[2] ?? "").trim();
      const keywords  = String(r[3] ?? "").trim();
      return { category, question, answer, keywords };
    })
    .filter(r => r.question && r.answer);

  if (debug) Logger.log(`[loadQA_] filtered qaList.length=${list.length}`);
  return list;
}
