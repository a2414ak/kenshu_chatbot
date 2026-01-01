/************************************************
 * OpenAI呼び出し：入力（完成プロンプト）→生成結果（本文のみ）
 ************************************************/
function callOpenAIText_(input) {
  const apiKey = PropertiesService.getScriptProperties().getProperty("OPENAI_API_KEY");
  if (!apiKey) throw new Error("OPENAI_API_KEY が未設定です");

  const res = UrlFetchApp.fetch("https://api.openai.com/v1/responses", {
    method: "post",
    contentType: "application/json",
    headers: { Authorization: "Bearer " + apiKey },
    payload: JSON.stringify({
      model: OPENAI_MODEL,
      input: String(input || "")
    }),
    muteHttpExceptions: true
  });

  const code = res.getResponseCode();
  const text = res.getContentText();
  if (code >= 300) throw new Error("OpenAI API error (" + code + "): " + text);

  const data = JSON.parse(text);
  return data.output_text || extractText_(data) || "回答を生成できませんでした";
}

/************************************************
 * OpenAI 呼び出し
 ************************************************/
function callOpenAI_(message, history, hits) {
  const apiKey = PropertiesService.getScriptProperties().getProperty("OPENAI_API_KEY");
  if (!apiKey) throw new Error("OPENAI_API_KEY が未設定です");

  const systemPrompt = `
あなたは社内向けQAチャットボットです。
以下のQA情報のみを根拠に回答してください。
書かれていない内容は推測せず「該当する情報がありません」と答えてください。
回答は日本語で簡潔にしてください。
`.trim();

  const qaText = hits.length
    ? hits.map((q, i) => `(${i + 1}) Q: ${q.question}\nA: ${q.answer}`).join("\n\n")
    : "該当QAなし";

  const historyText = Array.isArray(history)
    ? history.slice(-6).map(h => `${h.role}: ${h.content}`).join("\n")
    : "";

  const input = `
SYSTEM:
${systemPrompt}

QA:
${qaText}

${historyText ? "HISTORY:\n" + historyText : ""}

USER:
${message}
`.trim();

  const res = UrlFetchApp.fetch("https://api.openai.com/v1/responses", {
    method: "post",
    contentType: "application/json",
    headers: { Authorization: "Bearer " + apiKey },
    payload: JSON.stringify({ model: OPENAI_MODEL, input }),
    muteHttpExceptions: true
  });

  const code = res.getResponseCode();
  const text = res.getContentText();
  if (code >= 300) throw new Error("OpenAI API error (" + code + "): " + text);

  const data = JSON.parse(text);
  return data.output_text || extractText_(data) || "回答を生成できませんでした";
}

/**
 * OpenAI Embeddings
 */
function openaiEmbed_(text) {
  const apiKey = PropertiesService.getScriptProperties().getProperty("OPENAI_API_KEY");
  if (!apiKey) throw new Error("OPENAI_API_KEY が未設定です");

  const url = "https://api.openai.com/v1/embeddings";
  const headers = { Authorization: "Bearer " + apiKey };
  const payload = {
    model: EMBEDDING_MODEL,
    input: String(text || "")
  };

  const json = httpPostJson_(url, headers, payload);
  return json.data[0].embedding;
}

function httpPostJson_(url, headers, payload) {
  const res = UrlFetchApp.fetch(url, {
    method: "post",
    contentType: "application/json",
    headers,
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  });
  const code = res.getResponseCode();
  const text = res.getContentText();
  if (code < 200 || code >= 300) {
    throw new Error(`HTTP ${code}: ${text}`);
  }
  return JSON.parse(text);
}

function extractText_(data) {
  try {
    if (!Array.isArray(data.output)) return "";
    let out = "";
    for (const o of data.output) {
      if (!Array.isArray(o.content)) continue;
      for (const c of o.content) {
        if (typeof c.text === "string") out += c.text;
      }
    }
    return out;
  } catch {
    return "";
  }
}
