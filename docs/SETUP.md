# Operator setup and implementation boundaries

## Run

Node.js >=24.11 is required for built-in SQLite. No npm packages are required. Run `npm start`, open http://127.0.0.1:4173, generate and index demo files, then start cleanup. `npm run generate` generates and indexes the corpus from the terminal, replacing the synthetic state. `npm test` runs substantive pipeline, model-protocol and local HTTP checks.

The default listener is loopback only. This is an intentionally single-administrator synthetic demo without login or enterprise security. Do not upload real material or use it as a production service. Public binding requires explicit DEMO_PUBLIC=true. When using a reverse proxy set APP_ORIGIN to the exact external origin and protect the deployment separately. No public deployment has been performed.

## Qwen

Provide server-only environment variables:

```
QWEN_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
QWEN_MODEL=qwen3.8-max-0902
QWEN_API_KEY_FILE=/absolute/path/to/local-secret
```

Model ID must match the inference server’s served model name. The default is configurable, not an automatic model download. No API key is required for an unprotected local inference server; prefer a protected endpoint. Non-loopback HTTP requires explicit QWEN_ALLOW_HTTP=true on a trusted private network. Redirects are rejected; requests time out after 45 seconds. The adapter sends top-level enable_thinking=false to Alibaba Cloud and chat_template_kwargs.enable_thinking=false to self-hosted servers. The model server must support OpenAI-compatible /models and /chat/completions, tool calls and JSON output.

After configuring, restart the server, use Check Qwen in Agent workspace, then select Live Qwen agent and test real cleanup. The agent has at most 12 model turns and 36 tool calls per file, searches both channels before proposing actions, reads complete older sections before proposing replacement, and escalates incomplete evidence. Model-selected arguments are validated. Shell, SQL and arbitrary file tools are unavailable. Qwen never directly marks a source approved or writes to the index.

Current implementation uses locally trained LSA vectors for both execution modes. No external embedding model or neural encoder is claimed. The keyword index uses BM25-style scoring; the semantic index uses TF-IDF followed by a 20-dimensional truncated SVD. Reciprocal rank fusion combines the rankings; explicit version/dependency references get priority. This is intentionally small-corpus retrieval and needs real-corpus evaluation before broader use.

## Storage and modules

- src/corpus.cjs: managed corpus reset, manifest verification and chunking.
- src/source.cjs: bounded native DOCX/PPTX/XLSX extraction and Markdown/text extraction.
- src/retrieval.cjs: keyword scoring, LSA vectors, rank fusion and hard answer-view eligibility.
- src/agent.cjs: persistent newest-first jobs, local planner, Qwen tool loop, budgets and traces.
- src/lineage.cjs: version graph projection, answer eligibility and competing-branch detection.
- src/governance.cjs: structured relations, policy gates, version-bound review, logical archival and rollback.
- src/model.cjs: server-only OpenAI-compatible Qwen transport.
- src/answer.cjs: source selection, authority conflicts, customer exceptions and exact quotation checks.
- src/server.cjs: local demo API, same-origin mutations, optimistic revision checks and file allowlist.
- public/: English responsive UI. No external fonts, analytics or data connectors.

var/brain.sqlite persists operational state, embeddings, jobs, traces, reviews and audit. var/files/ holds the fictional original files. demo-files/ contains the generated input corpus for inspection and sharing; runtime copies the verified native files and removes only the previous manifest-listed files. Data is synthetic and is not encrypted. The database is not an external tamper-proof audit service.

The parser reads this generated corpus’s DOCX, PPTX (including speaker notes), XLSX (including worksheet and cell references), Markdown and text files. It is scoped to these authored fixtures; arbitrary Office upload, scanned PDF/OCR, email/Drive connectors and production authentication are not implemented. Source dates and original approvals are fixture metadata, not model-invented facts. All content is marked fictional. Evaluation expectations live only in test code and never enter retrieval tools.

## Decisions and recovery

Full replacement must cover all older clause keys. Partial replacement removes only selected keys from current answers. No file is permanently deleted. Same content from different customers cannot merge; retention restrictions route to review. A newer meeting cannot automatically displace a policy. Future activation and missing dates are blocked even in administrator review.

Before mutation, the server checks the UI revision. Reviews bind source and target hashes and versions. Job progress is saved after each file; startup marks unfinished jobs interrupted. Pause is checked before tools and commits. Resume uses the same corpus index snapshot. Index rebuilding intentionally clears previous cleanup decisions and restores the original fixture approvals. File-content mismatches fail indexing rather than silently reusing stale vectors.

Rollback restores governance metadata and relations only when no later governance change would be overwritten. Query/trace events do not invalidate otherwise compatible rollback. Re-indexing invalidates old rollback snapshots. Re-analyze a file to return it to the pending analysis queue; rerunning a completed job does not duplicate decisions.

For backups, stop the demo server before copying var/ as a unit. Keep this directory out of the source archive. A deployment-grade backup/migration system is outside this demonstration’s scope.

## Verification honesty

Tests cover generated actual inputs, keyword/semantic retrieval, source locations, client scope, newest-first scheduling, duplicate archival, explicit low-risk replacement, QBR coexistence, malicious document instructions, future/expired/missing dates, partial replacement, stale reviews, persistent state, pause/resume, rollback, re-indexing, exact quotations, forbidden tools and API isolation.

Live tool-loop and transport tests use explicitly labelled protocol fixtures. They establish implementation behavior, not the semantic accuracy of an actual Qwen model. The official Alibaba Cloud endpoint and pinned model have passed live authentication and inference checks. See eval/results/ for the separate live corpus evaluation; hardware capacity and public deployment remain unverified. Browser screenshots document actual local execution, not simulated LLM results. Original Task 3 still requires a reviewer-accessible share link for submission; localhost and this source bundle do not satisfy public hosting by themselves.

## Optional container

A Dockerfile is included; the local Docker daemon was unavailable, so its image build is not claimed as tested. For a local synthetic demo:

```
docker build -t cloudasta-rag-demo .
docker run --rm -p 127.0.0.1:4173:4173 -v cloudasta-demo:/data cloudasta-rag-demo
```

The image explicitly enables synthetic demo serving inside the container; the example publishes the port only on host loopback. Use the same app origin as the browser. Supply model environment and a read-only secret mount if using Qwen. Do not mount real documents into this demonstration.

## Re-authoring the source collection

`npm run generate` resets the runtime workspace from the checked-in `demo-files/` seeds. It does not require Office libraries or call a model. To change the authored business content, edit `src/demo-content.cjs` and run `scripts/author-corpus.mjs` from the project directory with `RUNTIME_NODE_MODULES` and `RUNTIME_PYTHON` pointing at an authoring runtime containing `docx`, `@oai/artifact-tool` and Python `openpyxl`. Authoring validates the PPTX exports and rebuilds the seed manifest. Re-authoring dependencies are not required by the deployed server.

## Alibaba Cloud Qwen configuration

The live workspace uses `QWEN_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1` and the pinned model `QWEN_MODEL=qwen3.8-max-0902`. This endpoint requires a Beijing-region Model Studio API key. The official service accepts top-level `enable_thinking:false`; self-hosted endpoints retain `chat_template_kwargs`. The key stays in the server environment. Start with `node --env-file-if-exists=.env src/server.cjs` to load the local `.env`. No browser form stores or receives the key.
