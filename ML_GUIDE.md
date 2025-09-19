# JanSetu NLP Multi-Task Classification Guide

This guide explains how to collect data, label it, train a multi-task transformer model (urgency + category), evaluate, serve, and integrate it in the frontend.

## 1. Define Labels
Urgency (start simple):
- urgent
- normal
(Optional later: low, medium, high)

Categories (initial suggestion):
- road
- sanitation
- water
- electricity
- health
- other

Keep labels lowercase, no spaces; expand later with retraining.

## 2. Data Collection
Export citizen issue text from your storage (Supabase/Firebase/etc.) into CSV format:
```
text
"Huge pothole causing accidents near main square"
"Street light not working in 5th avenue"
```
Save as `data/raw/issues_raw.csv`.

## 3. Create Annotation Sheet
Copy to `data/annotated/issues_labeled.csv` and add columns:
```
id,text,urgency,category
0001,"Huge pothole causing accidents near main square",urgent,road
```
Use a spreadsheet tool or simple editor. Target at least:
- Prototype: 150–300 rows
- MVP: 500–800 rows
- Better stability: 1k–2k rows

## 4. Quality Tips
- Balance classes: avoid >50% from a single category.
- Short + long descriptions mix.
- Remove near duplicates.
- If unsure label -> mark as `other` and revisit later.

## 5. Environment Setup (Windows PowerShell)
Create and activate a virtual environment (Python 3.10+ recommended):
```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install --upgrade pip
pip install -r ml/requirements.txt
```
(Optional GPU) Install CUDA build of torch as per https://pytorch.org/ .

Login to Hugging Face Hub (optional push):
```powershell
pip install huggingface_hub
huggingface-cli login
```

## 6. Train Model
```powershell
python ml/train_multitask.py --data data/annotated/issues_labeled.csv --model distilbert-base-uncased --out models/multitask-issue-classifier --epochs 4 --batch_size 8
```
(Adjust epochs after watching metrics; small dataset -> fewer epochs to avoid overfit.)

Artifacts:
```
models/multitask-issue-classifier/
  best.pt
  tokenizer.json / vocab files
```

## 7. Evaluate Metrics
During training you see lines like:
```
Epoch 3: train_loss=0.42 | urgency_acc=0.83 f1=0.82 | category_acc=0.79 f1=0.77
```
Track in a spreadsheet; aim for >0.75 F1 early. If category F1 is low:
- Add more examples for weak categories.
- Merge rare categories into `other`.
- Increase max_length if text truncated (default 256 tokens).

## 8. Inference Test (CLI)
```powershell
python backend/predict.py models/multitask-issue-classifier "Garbage piling near market entrance"
```
Expected output:
```
[{'urgency': 'urgent', 'category': 'sanitation'}]
```

## 9. Serve API
```powershell
uvicorn backend.app:app --reload --port 8001
```
Health check: http://localhost:8001/health
Predict:
```powershell
Invoke-WebRequest -Uri http://localhost:8001/predict -Method POST -Body '{"texts":["Broken road blocking traffic"]}' -ContentType 'application/json'
```

## 10. Frontend Integration
Set env var in `.env` (create at project root):
```
VITE_NLP_API_URL=http://localhost:8001
```
Usage example (inside a component):
```javascript
import { classifyIssue } from '../services/nlpService';

async function handleAutoClassify(desc) {
  const result = await classifyIssue(desc);
  console.log(result); // { urgency: 'urgent', category: 'road' }
}
```

## 11. Auto-Assist UI (Idea)
- After user types description, show suggested tags (editable).
- On submit, send both manual + model tags for auditing.
- Log misclassifications for future re-labeling.

## 12. Updating the Model
1. Append new labeled rows.
2. Re-run training (keep old + new data combined).
3. Version folders: `models/multitask-issue-classifier-v2`.
4. Update `MODEL_DIR` env for backend deployment.

## 13. Pushing to Hugging Face Hub (Optional)
Add flag manually (script minimal now):
```python
from huggingface_hub import create_repo, HfApi, upload_folder
create_repo(name="jansetu-multitask", exist_ok=True)
upload_folder(folder_path="models/multitask-issue-classifier", repo_id="<your-username>/jansetu-multitask")
```

## 14. Deployment Notes
- Containerize FastAPI + model (copy `best.pt` + tokenizer dir).
- Use CPU for light traffic; scale to GPU if latency > acceptable.
- Add simple caching (LRU) if same texts repeat.

## 15. Future Improvements
- Add confidence scores (softmax probabilities) to API.
- Add multi-label (if issues span multiple categories).
- Add translation pre-step if supporting multiple languages (Helsinki-NLP OPUS MT or NLLB).
- Use active learning: store low-confidence predictions to label first.
- Distill or quantize model (ONNX / BitsAndBytes) for faster inference.

## 16. Troubleshooting
| Problem | Cause | Fix |
|---------|-------|-----|
| All predictions same category | Imbalanced data | Collect more minority examples |
| Overfit (train high, eval low) | Too few samples / many epochs | Reduce epochs / add data |
| Slow inference | Large model | Switch to `distilbert` or quantize |
| CUDA OOM | Batch too large | Reduce `--batch_size` |

## 17. Security & Ethics
- Avoid storing raw personally identifiable text when exporting.
- Redact phone numbers / addresses in training data if not needed.
- Monitor for bias across regions / languages.

---
Questions: open an issue or extend this guide.
