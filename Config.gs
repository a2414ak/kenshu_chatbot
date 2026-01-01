/************************************************
 * 設定
 ************************************************/
const SPREADSHEET_ID = "1ee1Lwq4PbS4Q2DAh7vyLRQ-UGUp9FNFTo2Tpf_Lgvgg";
const SHEET_NAME = "QA"; // QAシート名
const OPENAI_MODEL = "gpt-4.1-mini";
const MAX_ROWS = 1500;
const MAX_HITS = 8;
const UPSTASH_VECTOR_REST_URL = getEnv_("UPSTASH_VECTOR_REST_URL");
const UPSTASH_VECTOR_REST_TOKEN = getEnv_("UPSTASH_VECTOR_REST_TOKEN");

/************************************************
 * Vector 検索設定
 ************************************************/
const EMBEDDING_MODEL = "text-embedding-3-small"; // Upstash index次元と一致させる
const UPSERT_BATCH_SIZE = 50; // 初回登録時の分割（必要なら調整）



/************************************************
 * ステップ式 応答フロー（タスク選択→条件収集→完成プロンプト→生成→穴埋め）
 ************************************************/
const TASK_OPTIONS_ = [
  { key: "email", label: "メールを書く" },
  { key: "summarize", label: "要約する" },
  { key: "polish", label: "文章を整える" },
  { key: "plan", label: "企画のたたき台" },
  { key: "intro", label: "説明文（導入案内）" },
  { key: "schedule", label: "スケジュール調整" },
];
const FIELD_ORDER_ = ["purpose", "audience", "background", "format", "tone"];
const RESET_MARKER_ = "【RESET】";
