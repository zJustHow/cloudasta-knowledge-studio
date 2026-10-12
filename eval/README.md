# Live Qwen evaluation

The benchmark was authored before the first live Qwen run on the refreshed corpus. It is not included in retrieval or sent to the model.

`gold.json` defines 12 required document-pair relationships and 19 safety/routing checks. After the live job completes, run `node --env-file-if-exists=.env scripts/evaluate-qwen.cjs`. This reads SQLite in read-only mode and refuses to report accuracy unless a live Qwen job has completed.

Report relationship recall, expected action accuracy and policy safety separately. Review every destructive proposal, missed required pair and cited passage manually. Add a review of other reported relations to estimate proposal precision. A safe policy outcome does not prove that Qwen made the right judgment. Pending administrator review is a deliberate outcome, not a completed human decision.

The first completed official Qwen run and eight answer probes are recorded in `results/Qwen_Evaluation.md`, with raw JSON results and evidence snapshots. Authentication, network or model-ID errors are execution failures, not model classification errors. All 30 files should be attempted; report failures in the coverage denominator rather than silently excluding them.
