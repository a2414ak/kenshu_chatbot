/************************************************
 * state復元：assistantメッセージの「✅行」から抽出（最後の値を採用）
 ************************************************/
function parseStateFromHistory_(hist) {
  const state = {
    taskKey: "",
    taskLabel: "",
    purpose: "",
    audience: "",
    background: "",
    format: "",
    tone: ""
  };

  // ★最後のリセット位置を探す（user/assistant両方を見ると堅い）
  let startIdx = 0;
  for (let i = 0; i < hist.length; i++) {
    const h = hist[i];
    const t = String(h?.content || "");
    if (t.includes(RESET_MARKER_) || (/^(リセット|最初から|やり直し)/.test(t.trim()) && h.role === "user")) {
      startIdx = i + 1;
    }
  }

  // ★リセット以降だけ走査
  for (let i = startIdx; i < hist.length; i++) {
    const h = hist[i];
    if (!h || h.role !== "assistant") continue;
    const t = String(h.content || "");

    const mTask = t.match(/✅タスク：(.+)\s*$/m);
    if (mTask) {
      state.taskLabel = mTask[1].trim();
      const found = TASK_OPTIONS_.find(x => x.label === state.taskLabel);
      state.taskKey = found ? found.key : state.taskKey;
    }

    const m1 = t.match(/✅目的：(.+)\s*$/m);
    if (m1) state.purpose = m1[1].trim();

    const m2 = t.match(/✅相手\/読者：(.+)\s*$/m);
    if (m2) state.audience = m2[1].trim();

    const m3 = t.match(/✅背景：([\s\S]+?)\s*$/m);
    if (m3) state.background = m3[1].trim();

    const m4 = t.match(/✅出力形式：(.+)\s*$/m);
    if (m4) state.format = m4[1].trim();

    const m5 = t.match(/✅トーン：(.+)\s*$/m);
    if (m5) state.tone = m5[1].trim();
  }

  if (!state.taskKey && state.taskLabel) {
    const found = TASK_OPTIONS_.find(x => x.label === state.taskLabel);
    if (found) state.taskKey = found.key;
  }

  return state;
}


function findLastAssistantText_(hist) {
  for (let i = hist.length - 1; i >= 0; i--) {
    const h = hist[i];
    if (h && h.role === "assistant") return String(h.content || "");
  }
  return "";
}

/************************************************
 * ステップ2：質問（選択肢＋短文入力）
 ************************************************/
function detectPendingField_(assistantText) {
  const t = String(assistantText || "");

  // 通常質問
  if (t.includes("【質問】目的")) return "purpose";
  if (t.includes("【質問】相手/読者")) return "audience";
  if (t.includes("【質問】背景")) return "background";
  if (t.includes("【質問】出力形式")) return "format";
  if (t.includes("【質問】トーン")) return "tone";

  // ★補足質問（その他）
  if (t.includes("【補足質問】目的")) return "purpose";
  if (t.includes("【補足質問】相手/読者")) return "audience";
  if (t.includes("【補足質問】出力形式")) return "format";
  if (t.includes("【補足質問】トーン")) return "tone";

  return "";
}


function findNextMissingField_(state) {
  for (const f of FIELD_ORDER_) {
    if (!String(state[f] || "").trim()) return f;
  }
  return "";
}
