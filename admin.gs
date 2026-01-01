

/************************************************
 * ステップ1：タスク選択
 ************************************************/
function buildStep1TaskPrompt_(isReset) {
  const lines = [];
  if (isReset) lines.push("リセットしました。ステップ1から進めます。", "");
  lines.push("【ステップ1】タスクを選んでください。（番号でOKです）");
  TASK_OPTIONS_.forEach((t, i) => lines.push(`${i + 1}. ${t.label}`));
  lines.push("");
  lines.push("例）「1」または「メールを書く」");
  return lines.join("\n");
}

function parseTaskSelection_(msg) {
  const t = normalizeUserText_(msg);

  // 数字
  const num = t.match(/^([1-6])$/);
  if (num) {
    const idx = Number(num[1]) - 1;
    return TASK_OPTIONS_[idx] || null;
  }

  // ラベル部分一致
  const found = TASK_OPTIONS_.find(x => t.includes(x.label));
  return found || null;
}

function buildStep2Question_(field, taskLabel) {
  switch (field) {
    case "purpose":
      return [
        "【ステップ2】条件を集めます（選択＋短文でOKです）",
        "【質問】目的（何のため？）",
        "1. 依頼  2. 共有  3. お礼  4. 謝罪  5. 報告  6. 提案  7. その他（自由入力）",
        "例）「1」または「研修内容を同僚に共有したい」"
      ].join("\n");

    case "audience":
      return [
        "【質問】相手/読者（誰向け？）",
        "1. 上司  2. 同僚  3. 部下  4. 社外（取引先）  5. 顧客  6. その他（自由入力）",
        "例）「2」または「同じチームのメンバー」"
      ].join("\n");

    case "background":
      return [
        "【質問】背景（前提・状況）",
        "・2〜5行くらいの短文でOKです。",
        "・要約/文章整形の場合は「元の文章」をここに貼ってください。",
        "例）「生成AI研修を受けた。明日朝会で10分共有したい。要点はプロンプトの型。」"
      ].join("\n");

    case "format":
      return [
        "【質問】出力形式（形式/文字数）",
        "1. 箇条書き（〜8点）  2. メール  3. 表  4. 短文（〜200字）  5. 長文（〜800字）  6. その他（自由入力）",
        "例）「2」「短文200字」「表で3行」"
      ].join("\n");

    case "tone":
      return [
        "【質問】トーン（文体）",
        "1. 丁寧  2. カジュアル  3. 社内向け（丁寧だがくだけた）  4. フォーマル（社外）  5. その他（自由入力）",
        "例）「1」または「社内向けで柔らかく」"
      ].join("\n");

    default:
      return `【質問】${field}`;
  }
}

function buildOtherFollowupQuestion_(field) {
  const label =
    field === "purpose" ? "目的" :
    field === "audience" ? "相手/読者" :
    field === "format" ? "出力形式" :
    field === "tone" ? "トーン" : "内容";

  return [
    `【補足質問】${label}（その他）`,
    "ありがとうございます。「その他」を選ばれました。",
    "短文で具体例を1行ください（そのままコピペして使います）。",
    "例）「研修内容を同僚に共有し、明日からの業務に活かしてもらいたい」"
  ].join("\n");
}

function getOtherChoiceNumber_(field) {
  switch (field) {
    case "purpose":  return 7; // 1〜7
    case "audience": return 6; // 1〜6
    case "format":   return 6; // 1〜6
    case "tone":     return 5; // 1〜5
    default:         return null;
  }
}

function isOtherSelection_(field, msg) {
  const t = normalizeDigits_(msg);
  if (!/^\d+$/.test(t)) return false;
  const n = Number(t);
  const otherNum = getOtherChoiceNumber_(field);
  return otherNum != null && n === otherNum;
}

function buildCapturedLine_(field, value) {
  const v = String(value || "").trim();
  switch (field) {
    case "purpose": return `✅目的：${v}`;
    case "audience": return `✅相手/読者：${v}`;
    case "background": return `✅背景：${v}`;
    case "format": return `✅出力形式：${v}`;
    case "tone": return `✅トーン：${v}`;
    default: return "";
  }
}



