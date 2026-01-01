/************************************************
 * utility
 ************************************************/
function normalizeDigits_(s) {
  return String(s || "")
    // 全角数字 → 半角数字
    .replace(/[０-９]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xFEE0))
    // 全角スペース → 半角スペース
    .replace(/\u3000/g, " ")
    .trim();
}

function normalizeUserText_(s) {
  return String(s || "").trim();
}

function tokenize_(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .split(" ")
    .filter(Boolean);
}

function coerceFieldValue_(field, msg) {
  const t = normalizeDigits_(msg);

  if (/^\d+$/.test(t)) {
    const n = Number(t);

    const map = {
      purpose:  ["依頼","共有","お礼","謝罪","報告","提案","その他"],
      audience: ["上司","同僚","部下","社外（取引先）","顧客","その他"],
      format:   ["箇条書き（〜8点）","メール","表","短文（〜200字）","長文（〜800字）","その他"],
      tone:     ["丁寧","カジュアル","社内向け（丁寧だがくだけた）","フォーマル（社外）","その他"]
    };

    if (map[field] && n >= 1 && n <= map[field].length) {
      return map[field][n - 1];
    }
  }

  return t;
}

function isRelevantInput_(field, msg) {
  const t = normalizeDigits_(msg);
  if (!t) return false;

  // 数字だけ回答の許可（フィールド別に範囲チェック）
  if (/^\d+$/.test(t)) {
    const n = Number(t);
    switch (field) {
      case "purpose":   return n >= 1 && n <= 7;
      case "audience":  return n >= 1 && n <= 6;
      case "format":    return n >= 1 && n <= 6;
      case "tone":      return n >= 1 && n <= 5;
      default:          return true;
    }
  }

  // 数字以外
  switch (field) {
    case "purpose":   return t.length >= 2;
    case "audience":  return t.length >= 1;
    case "background":return t.length >= 5;
    case "format":    return /(箇条書き|メール|表|短文|長文|字|文字)/.test(t) || t.length >= 2;
    case "tone":      return /(丁寧|カジュアル|社内|フォーマル|硬め|柔らかめ)/.test(t) || t.length >= 2;
    default:          return true;
  }
}
