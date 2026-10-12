# Cloudasta Knowledge Studio

## Overview

Knowledge Studio finds duplicate documents, compares revisions, asks you to review uncertain changes, and answers questions with source citations. Original files are preserved.

**Demo only:** 30 fictional documents, no sign-in, and no connection to Cloudasta accounts. Use fictional information only.

## Getting Started

### Setup

1. Install **Node.js 24.11 or newer** from [nodejs.org](https://nodejs.org/). Reopen **Terminal** (macOS) or **PowerShell** (Windows), then check:

   ```sh
   node --version
   npm --version
   ```

2. Extract the project ZIP if needed. Type `cd ` in the terminal, drag the **agentic-rag** folder into the window, and press Enter. Choose the folder containing `package.json`.
3. Start the app:

   ```sh
   npm start
   ```

4. Keep the terminal open and visit [http://127.0.0.1:4173](http://127.0.0.1:4173) on the same computer.

No `npm install` or API key is needed for local mode. **Ctrl+C** stops the app; run `npm start` from the same folder to restart. Your work is saved locally.

### API Configuration (Optional)

For AI mode, open **`.env` beside `package.json`** in a plain-text editor. If missing, copy `.env.example` and rename the copy to `.env`, not `.env.txt`. On macOS, **Command+Shift+.** shows hidden files.

```dotenv
QWEN_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
QWEN_MODEL=qwen3.8-max-0902
QWEN_API_KEY=PASTE_YOUR_API_KEY_HERE
```

Paste your API key **after `QWEN_API_KEY=`**, without spaces. Remove or comment out any active `QWEN_API_KEY_FILE=` line, which otherwise takes priority. Save, stop and restart the app, refresh the browser, then select **Cleanup → Check Qwen**. Keep `.env` private and out of shared ZIPs.

**Other providers:** keep these variable names and replace the base URL, model name, and key. The provider must offer an OpenAI-compatible API with `/models`, `/chat/completions`, Bearer authentication, tool calling, and JSON output. Do not append the endpoint paths to the base URL.

Some providers reject the extra `chat_template_kwargs` setting this app sends and require a code change. The interface still says **Qwen**. **Check Qwen** checks the model list only; also test cleanup and questions. See [Operator setup](docs/SETUP.md) for more options.

### Workflow

| Step | Action |
| --- | --- |
| Prepare | **File library → Generate demo files → Build full index**. Skip if already indexed. |
| Clean up | **Cleanup → Local evidence planner → Start cleanup**, or choose **Live Qwen agent** after configuring AI. |
| Review | Open **Review queue** and compare source passages before approving changes. |
| Ask | Open **Ask**, choose **Global** or a customer, and try “How quickly should customer kickoff be scheduled?” |

Check answer citations; AI answers can contain mistakes. Leave **Historical evidence** unchecked for current policy. **Processed** means analysis and decisions are complete; check knowledge status to see what remains current.

## Troubleshooting

| Problem | Next step |
| --- | --- |
| App will not open | Check that `npm start` is running; use the address shown in the terminal. |
| Startup error | Check the Node.js version, reopen the terminal, and confirm the folder contains `package.json`. |
| No files or answer | Generate and index files if needed. Check the customer and try a specific question. Draft, expired, and future policies cannot support current answers. |
| Paused or interrupted | Click **Resume workspace**, then **Cleanup → Resume this run**. |
| “State changed” | Refresh, check the latest information, and retry. |
| Failed file | Open the file, read its error, fix the cause, then **Re-analyze this file** and start cleanup. |
| AI error | Check `.env`, restart, and use **Check Qwen**. Use local mode meanwhile. |
| Wrong decision | Use **Activity → Roll back** where available; later changes may block it. |

**Reset carefully:** rebuilding the index clears cleanup decisions; resetting demo files also clears runs and reviews. For unresolved issues, send the demo operator the error and steps to reproduce it, without passwords or API keys.
