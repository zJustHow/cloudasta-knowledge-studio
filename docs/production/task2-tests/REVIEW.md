# Task 2 — Actual prompt-test review

Test date: October 12, 2026. Tool: Qwen Chat Completions through the demo’s existing server-side adapter. Model: qwen3.8-max-0902. Fictional evidence only. No Gemini Enterprise test, real Workspace access or governance execution occurred.

## Method

Compared each output with the supplied document chunks and fixture metadata. Two iterations per prompt; v1 files preserve the first attempts. The unsuffixed prompt/result files are the revised run. This is a manual demonstration check, not an independent accuracy benchmark. The source packs were supplied in full, so this does not evaluate retrieval recall.

## Current Policy Check

- Correct: current two-business-day requirement; previous five-day requirement; explicit replacement; later meeting discussion cannot override the approved procedure.
- First-attempt issue: some assertions cited bare document IDs instead of exact evidence chunk IDs. Added labelled metadata chunks and explicit citation requirements.
- Revised residual: “As of 2026-10-12, v2 is current” in the checks array has no inline citation. The model’s “None” uncertainty is its statement about the fixture, not a calibrated confidence score.
- Review disposition: main answer useful; repair the uncited checklist claim or omit it. Do not accept as universally citation-complete.

## Account Brief

- Correct: 45 to 68 weekly active users is +23 users and +23 percentage points of 100 seats; snapshot periods are distinguished from quarterly totals.
- Correct: four-week migration is not an engineering commitment; six-week fallback and the two concrete blockers are preserved.
- Correct: approved $21/user/month subscription is separate from proposed $12,000 project services.
- First-attempt issue: already-recorded actions appeared under suggested recommendations. Required recorded/suggested arrays and explicit treatment of missing dates.
- Revised residual: the model combines the mailbox-owner roster and archive escalation into one Dana Lewis action with a September 18 deadline. The transcript assigns that deadline to the roster; the archive escalation deadline is not specified. Split these actions and retain unknown timing before use.
- Review disposition: core synthesis useful; action deadline needs correction. Do not claim perfect extraction accuracy.

## Reproduction and limits

`scripts/test-task2-demos.cjs` loads a read-only snapshot of the fictional SQLite corpus and calls the configured Qwen adapter. It requires server-side model credentials; never embed keys in the prompts or this folder. Rerunning may produce different wording. The exact model, test time, token usage and returned JSON are saved in each result file. Prompt files contain the full evidence packs, including fixture metadata.

No percentage accuracy is inferred from two prompts. Production acceptance requires owner-labelled held-out cases, retrieval evaluation, source authority validation, permissions tests, and recovery/load testing.
