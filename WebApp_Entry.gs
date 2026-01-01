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
function init() {
  const welcome = "こんにちは。お好きなキーを押すと開始します。";

  return {
    answer: welcome,
  };
}
