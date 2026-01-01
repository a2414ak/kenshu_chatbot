
function upstashUpsertMany_(vectors) {
  const baseUrl = String(UPSTASH_VECTOR_REST_URL || "").replace(/\/+$/, "");
  const namespace = PropertiesService.getScriptProperties().getProperty("UPSTASH_VECTOR_NAMESPACE") || "";

  const url = namespace
    ? `${baseUrl}/upsert?namespace=${encodeURIComponent(namespace)}`
    : `${baseUrl}/upsert`;

  const bodyArray = vectors.map(v => ({
    id: String(v.id),
    vector: (v.vector || v.values || []).map(n => Number(n)),
    metadata: v.metadata || {},
  }));

  const payload = JSON.stringify(bodyArray);

  Logger.log(`[upstash] POST ${url} count=${bodyArray.length} payloadChars=${payload.length}`);
  Logger.log(`[upstash] payload head=${payload.slice(0, 250)}`);
  Logger.log(`[upstash] payload tail=${payload.slice(Math.max(0, payload.length - 250))}`);

  const res = UrlFetchApp.fetch(url, {
    method: "post",
    contentType: "application/json",
    payload,
    muteHttpExceptions: true,
    headers: {
      Authorization: `Bearer ${UPSTASH_VECTOR_REST_TOKEN}`,
    },
  });

  const code = res.getResponseCode();
  const text = res.getContentText();

  Logger.log(`[upstash] status=${code}`);
  Logger.log(`[upstash] response(head)=${text.slice(0, 800)}`);

  if (code < 200 || code >= 300) {
    throw new Error(`Upstash upsert failed: status=${code} body=${text}`);
  }

  return text;
}

/**
 * Upstash Vector: query
 */
function upstashQuery_(vector, topK) {
  const props = PropertiesService.getScriptProperties();
  const baseUrl = props.getProperty("UPSTASH_VECTOR_REST_URL");
  const token = props.getProperty("UPSTASH_VECTOR_REST_TOKEN");
  if (!baseUrl || !token) throw new Error("UPSTASH_VECTOR_REST_URL / TOKEN が未設定です");

  const url = `${baseUrl}/query`;
  const headers = { Authorization: `Bearer ${token}` };

  const payload = {
    vector,
    topK: topK,
    includeMetadata: true,
  };
  return httpPostJson_(url, headers, payload);
}

/**
 * Upstashのレスポンス差分吸収（result / results どちらでも）
 */
function normalizeUpstashHits_(resp) {
  const arr = resp?.result || resp?.results || [];
  return Array.isArray(arr) ? arr : [];
}

function postJson_(url, bodyObj) {
  const payload = JSON.stringify(bodyObj);

  const res = UrlFetchApp.fetch(url, {
    method: "post",
    contentType: "application/json",
    payload,
    muteHttpExceptions: true,
    headers: {
      Authorization: `Bearer ${UPSTASH_VECTOR_REST_TOKEN}`,
    },
  });

  return {
    status: res.getResponseCode(),
    body: res.getContentText(),
    payloadChars: payload.length,
  };
}
