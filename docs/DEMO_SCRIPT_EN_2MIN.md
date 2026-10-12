# Cloudasta Agentic RAG — Two-Minute Demo

Approximately 210 spoken words. Allow about 1 minute 40 seconds for speaking and brief navigation. Use the completed run; do not restart cleanup or wait for live queries during this presentation. Bracketed directions are not spoken.

[Start on Overview.]

Hi everyone. This is my agentic RAG demo for keeping business knowledge current.

It uses 30 fictional files: SOPs, proposal decks, QBR notes, pricing frameworks, and meeting transcripts. There are no real company connections, and one administrator role.

The architecture has four steps: parse and chunk every file, build keyword and semantic indexes, let Qwen compare newer files with older ones, and apply governance rules. Qwen proposes changes; rules control execution, and uncertain cases go to the administrator. Answers use approved, effective passages with citations.

[Open Document lineage. Select Workspace access procedure | Revision 1.0.]

Here’s an actual update. The old access SOP allowed five business days to provision an account. The approved revision reduces that to two. The agent linked the versions and marked the old policy as superseded.

[Select Acme QBR notes · Q2. Enable Show references & duplicates.]

Here, the shared Q2 copy is an exact duplicate, so it is logically archived. But Q1 and Q2 remain separate historical records.

[Select Customer onboarding and service acceptance. Click the Partial link.]

This amendment changes kickoff scheduling from ten days to three, while preserving security and handoff procedures. Because it is still a draft, the change needs administrator approval.

The graph makes these decisions inspectable. This is a working prototype; broader testing is still needed before production.
