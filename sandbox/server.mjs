import http from "node:http";
import { auditSummary, validateSandboxPayload } from "./lib/validate.mjs";
import { executeInDocker } from "./lib/run.mjs";

const PORT = Number(process.env.SANDBOX_PORT || 8787);
const TOKEN = process.env.SANDBOX_TOKEN || "dev-local-sandbox-token";
const BIND = process.env.SANDBOX_BIND || "127.0.0.1";

function readJson(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > 120_000) {
        reject(new Error("Request body too large."));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}"));
      } catch {
        reject(new Error("Invalid JSON body."));
      }
    });
    req.on("error", reject);
  });
}

function send(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "content-type": "application/json",
    "content-length": Buffer.byteLength(payload),
  });
  res.end(payload);
}

const server = http.createServer(async (req, res) => {
  if (req.method === "GET" && req.url === "/health") {
    return send(res, 200, { ok: true, service: "engineer-zero-sandbox" });
  }

  if (req.method !== "POST" || req.url !== "/run") {
    return send(res, 404, { status: "rejected", stdout: "", stderr: "", exitCode: null, durationMs: null, message: "Not found." });
  }

  const auth = req.headers.authorization || "";
  if (auth !== `Bearer ${TOKEN}`) {
    return send(res, 401, { status: "rejected", stdout: "", stderr: "", exitCode: null, durationMs: null, message: "Unauthorized sandbox request." });
  }

  let body;
  try {
    body = await readJson(req);
  } catch (error) {
    return send(res, 400, {
      status: "rejected",
      stdout: "",
      stderr: "",
      exitCode: null,
      durationMs: null,
      message: error instanceof Error ? error.message : "Invalid request.",
    });
  }

  const invalid = validateSandboxPayload(body);
  if (invalid) {
    return send(res, 400, {
      status: "rejected",
      stdout: "",
      stderr: "",
      exitCode: null,
      durationMs: null,
      message: invalid,
    });
  }

  const result = await executeInDocker(body.request);
  console.info(JSON.stringify({ type: "sandbox.audit", ...auditSummary(body.request, result) }));
  const statusCode = result.status === "rejected" ? 400 : result.status === "unavailable" ? 503 : 200;
  return send(res, statusCode, {
    status: result.status === "unavailable" ? "rejected" : result.status,
    stdout: result.stdout,
    stderr: result.stderr,
    exitCode: result.exitCode,
    durationMs: result.durationMs,
  });
});

server.listen(PORT, BIND, () => {
  console.info(`engineer-zero-sandbox listening on http://${BIND}:${PORT}`);
});
