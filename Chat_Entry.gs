function chat(message, history) {
  try {
    const msg = normalizeDigits_(String(message || "").trim());
    const hist = Array.isArray(history) ? history : [];
    if (!msg) return { error: "message is required" };

    // リセット（任意）
    if (/^(リセット|最初から|やり直し)/.test(msg)) {
      // ★マーカーを先頭に入れて、履歴上の「ここから新セッション」を作る
      return { answer: `${RESET_MARKER_}\n` + buildStep1TaskPrompt_(true), hitCount: 0 };
    }


    const state = parseStateFromHistory_(hist);

    // --- ステップ1：タスク選択 ---
    if (!state.taskKey) {
      const chosen = parseTaskSelection_(msg);
      if (!chosen) {
        return { answer: buildStep1TaskPrompt_(false), hitCount: 0 };
      }
      const nextQ = buildStep2Question_("purpose", chosen.label);
      return {
        answer: [
          `✅タスク：${chosen.label}`,
          "",
          nextQ
        ].join("\n"),
        hitCount: 0
      };
    }

    // 直前のボット質問から「今ユーザーが答えている項目」を推定
    const lastAssistantText = findLastAssistantText_(hist);
    const pendingField = detectPendingField_(lastAssistantText);

    // pendingField があり、まだ state に入っていないなら、この msg をその回答として確定
    let justCapturedLine = "";
if (pendingField && !state[pendingField]) {

  // ★(A) 「その他」を選んだら、確定せず追加質問へ
  if (isOtherSelection_(pendingField, msg)) {
    return {
      answer: [
        buildOtherFollowupQuestion_(pendingField),
        "",
        "（選び直す場合は、もう一度 1〜 の番号を送ってください）"
      ].join("\n"),
      hitCount: 0
    };
  }

  // (B) 無関係入力なら確定せず、同じ質問を再提示
  if (!isRelevantInput_(pendingField, msg)) {
    return {
      answer: [
        "少し話題が違うようです。",
        "いまは、次の質問に答えてもらえると助かります。",
        "",
        buildStep2Question_(pendingField, state.taskLabel)
      ].join("\n"),
      hitCount: 0
    };
  }

  // (C) 正常系：数字→ラベル変換（ただし「その他」は(A)で弾かれるのでここには来ません）
  const value = coerceFieldValue_(pendingField, msg);
  justCapturedLine = buildCapturedLine_(pendingField, value);
  state[pendingField] = value;
}


    // --- ステップ2：不足項目を順番に質問 ---
    const missing = findNextMissingField_(state);
    if (missing) {
      const q = buildStep2Question_(missing, state.taskLabel);
      return {
        answer: [
          justCapturedLine,
          justCapturedLine ? "" : "",
          q
        ].filter(Boolean).join("\n"),
        hitCount: 0
      };
    }

    // --- ステップ3：完成プロンプト生成 + 生成結果 ---
    const completedPrompt = buildCompletedPrompt_(state);
    const generated = callOpenAIText_(completedPrompt);

    const coverageLine = buildCoverageLine_(state);
    const fillTemplate = buildFillInTemplate_(state.taskLabel);

    const answer = [
      "【ステップ3】完成プロンプト（コピペ）",
      "```",
      completedPrompt,
      "```",
      "",
      "【生成結果】",
      generated,
      "",
      coverageLine,
      "",
      "【ステップ4】（任意・30秒）次回も使えるように、穴埋め版にしますね。",
      "```",
      fillTemplate,
      "```",
      "",
      "※やり直す場合は「最初から」または「リセット」と送ってください。"
    ].join("\n");

    // もし pendingField を今確定したタイミングなら、その行も先頭に付ける
    return {
      answer: justCapturedLine ? (justCapturedLine + "\n\n" + answer) : answer,
      hitCount: 0
    };

  } catch (err) {
    return { error: err.message || String(err) };
  }
}

function chat_rag(message, history) {

}
