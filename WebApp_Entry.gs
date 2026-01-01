/************************************************
 * Webアプリ表示
 ************************************************/
function doGet() {
  return HtmlService.createHtmlOutputFromFile("index")
    .setTitle("Sheet Chatbot");
}

/**
 * 初回表示用：ページロード時に呼ばれる
 * フロント側で固定文を持たず、ここで初回メッセージを返します。
 */
function init(mode) {
  try {
    const m = String(mode || "chat");

    const answer = (m === "rag")
      ? "こんにちは。RAGモードです。社内ナレッジ（検索結果）を優先して回答します。質問をどうぞ。"
      : "こんにちは。お好きなキーを押すと開始します。";

    return { answer, mode: m };
  } catch (err) {
    return { error: err.message || String(err) };
  }
}

