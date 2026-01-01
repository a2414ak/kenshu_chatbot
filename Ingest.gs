function ingestQAtoUpstash() {
  // debug: true で読み取り状況をLoggerに出す
  const qaList = loadQA_({ debug: true });

  Logger.log(`[ingest] qaList.length=${qaList.length}`);
  if (!qaList.length) {
    Logger.log("QAが空です（loadQA_の結果が0件）");
    Logger.log("→ 上の [loadQA_] ログ（header / non-empty counts / sample rows）を見て、列ズレ or シートの中身を確認してください。");
    return;
  }

  const vectors = [];
  for (let i = 0; i < qaList.length; i++) {
    const qa = qaList[i];

    const textForEmbedding = `${qa.question}\n${qa.answer}\n${qa.keywords || ""}`;
    const embedding = openaiEmbed_(textForEmbedding);
    const id = `qa-${i + 1}`;

    Logger.log(`[embed] dim=${embedding.length} first3=${embedding.slice(0,3).join(",")}`);

    // --- embedding健全性チェック ---
    if (!Array.isArray(embedding)) {
      throw new Error(`[embed] embedding is not array. type=${typeof embedding}`);
    }
    const dim = embedding.length;
    const bad = embedding.find(v => typeof v !== "number" || !isFinite(v));
    if (bad !== undefined) {
      throw new Error(`[embed] embedding contains invalid number: ${bad} dim=${dim}`);
    }
    Logger.log(`[embed] dim=${dim} sample=[${embedding[0]}, ${embedding[1]}, ${embedding[2]}]`);


    vectors.push({
      id,
      vector: embedding,
      metadata: {
        category: qa.category || "",
        question: qa.question || "",
        answer: qa.answer || "",
        keywords: qa.keywords || ""
      }
    });

    if (vectors.length >= UPSERT_BATCH_SIZE) {
      Logger.log(`[ingest] upsert batch size=${vectors.length} (i=${i + 1}/${qaList.length})`);
      upstashUpsertMany_(vectors.splice(0, vectors.length));
      Utilities.sleep(200);
    }
  }

  if (vectors.length) {
    Logger.log(`[ingest] upsert final batch size=${vectors.length}`);
    upstashUpsertMany_(vectors);
  }

  Logger.log(`Ingest complete. count=${qaList.length}`);

  const byCategory = qaList.reduce((acc, r) => {
    const k = r.category || "(no category)";
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});
  
  Logger.log(`[ingest] category counts=${JSON.stringify(byCategory)}`);

}
