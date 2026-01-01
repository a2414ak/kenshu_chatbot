/************************************************
 * ステップ3：完成プロンプト生成（コピペ用）
 ************************************************/
function buildCompletedPrompt_(state) {
  const task = state.taskLabel || "タスク";
  const purpose = state.purpose || "";
  const audience = state.audience || "";
  const background = state.background || "";
  const format = state.format || "";
  const tone = state.tone || "";

  // タスク別に少しだけ指示を最適化
  let taskInstruction = "";
  switch (state.taskKey) {
    case "email":
      taskInstruction = "目的と背景に沿って、相手に失礼のない実務メールを作成してください。件名も付けてください。";
      break;
    case "summarize":
      taskInstruction = "背景に貼られた文章を、目的と読者に合わせて要約してください。事実を落とさず、推測はしないでください。";
      break;
    case "polish":
      taskInstruction = "背景に貼られた文章を、意味を変えずに読みやすく整えてください（冗長削減・表現統一・誤字脱字修正）。";
      break;
    case "plan":
      taskInstruction = "目的と背景を踏まえて、実行可能な企画のたたき台（狙い/対象/施策案/運用/リスク/次アクション）を作ってください。";
      break;
    case "intro":
      taskInstruction = "目的と読者に合わせて、導入案内の説明文を作成してください（何ができるか/メリット/使い方/次の一歩）。";
      break;
    case "schedule":
      taskInstruction = "目的と背景に沿って、日程調整のメッセージを作ってください（候補日提示/返信しやすさ重視）。";
      break;
    default:
      taskInstruction = "条件に従って文章を作成してください。";
  }

  return [
    "あなたはビジネス文書作成のプロです。次の条件を満たす出力のみを返してください。",
    "",
    `【タスク】${task}`,
    `【目的】${purpose}`,
    `【相手/読者】${audience}`,
    `【背景】${background}`,
    `【出力形式】${format}`,
    `【トーン】${tone}`,
    "",
    "【制約】",
    "・事実が不明な点は断定しない（必要なら確認質問ではなく「仮置き」を明示）。",
    "・余計な解説はせず、完成物だけを出力する。",
    "",
    `【指示】${taskInstruction}`
  ].join("\n");
}

function buildCoverageLine_(state) {
  // 「研修の4条件」＝目的/相手/背景/出力形式 を可視化（トーンは追加で表示）
  const p = state.purpose ? "目的✅" : "目的⬜";
  const a = state.audience ? "相手✅" : "相手⬜";
  const b = state.background ? "背景✅" : "背景⬜";
  const f = state.format ? "出力形式✅" : "出力形式⬜";
  const t = state.tone ? "トーン✅" : "トーン⬜";
  return `条件充足：${p} ${a} ${b} ${f} / ${t}`;
}

/************************************************
 * ステップ4：穴埋めプロンプト（テンプレ）
 ************************************************/
function buildFillInTemplate_(taskLabel) {
  return [
    `【タスク】${taskLabel || "（ここにタスク名）"}`,
    "目的：＿＿",
    "読者：＿＿",
    "背景：＿＿",
    "出力形式：＿＿",
    "制約：＿＿（例：文字数、必ず入れる要点、NG表現など）",
    "トーン：＿＿",
  ].join("\n");
}
