# JanSetu

Citizen issue reporting and governance dashboard (React + Vite). This document now includes the upcoming NLP pipeline plan for auto‑classifying citizen reports (urgency + issue category) using a single fine‑tuned Hugging Face model.

## Roadmap (NLP Auto Classification)

| Stage | Status | Description |
|-------|--------|-------------|
| Data Collection | Pending | Export existing / future citizen reports text. |
| Label Definition | Pending | Define urgency (e.g. `urgent`, `normal`) & categories (e.g. `road`, `sanitation`, `water`, `electricity`, `health`, `other`). |
| Annotation | Pending | Create labeling CSV + lightweight labeling UI (manual first). |
| Model Training | Pending | Fine‑tune a single transformer (multi‑task) with Hugging Face. |
| Evaluation | Pending | Track accuracy / F1 per task. |
| Serving API | Pending | FastAPI service inside `backend/` folder. |
| Frontend Integration | Pending | Call `/predict` to tag new issues automatically. |

## NLP Architecture (Planned)

We will train one base encoder (e.g. `distilbert-base-uncased`) with two classification heads:
- Head A: Urgency (binary or 3‑level if later: `low`, `medium`, `high`).
- Head B: Category (multi-class: road, sanitation, water, electricity, health, other, ...).

Training script (to be added): `ml/train_multitask.py`

Output artifacts (after training):
```
models/
	multitask-issue-classifier/
		config.json
		tokenizer.json
		tokenizer.model (if sentencepiece)
		pytorch_model.bin
```

## Annotation File Format (planned)
We will maintain a unified CSV (later convertible to Hugging Face Dataset):
```
id,text,urgency,category
0001,"Huge pothole causing accidents near main square",urgent,road
0002,"Street light not working on 5th avenue",normal,electricity
0003,"Garbage piling near market entrance",urgent,sanitation
```

## Minimal Steps (Preview)
1. Export / collect raw issue texts -> `data/raw/issues_raw.csv`.
2. Copy to `data/annotated/issues_labeled.csv` and fill `urgency` + `category` manually for first batch (≈300–500 rows to start).
3. Run `python ml/train_multitask.py --data data/annotated/issues_labeled.csv --model distilbert-base-uncased --out models/multitask-issue-classifier`.
4. Evaluate printed metrics; iterate if needed.
5. (Optional) `huggingface-cli login` then `--push_to_hub your-username/jansetu-multitask`.
6. Start FastAPI server `python backend/app.py` and integrate frontend `nlpService`.

Detailed instructions will be appended once scripts are added.

## Development (Frontend)
Standard Vite React workflow.

Install deps:
```
npm install
```
Start dev server:
```
npm run dev
```

## ESLint
See `eslint.config.js` for current rules (template defaults). Will expand later if needed.

---
_This README section was extended to prepare for upcoming NLP model integration._
