import argparse
import os
import pandas as pd
from dataclasses import dataclass
from typing import Dict, List, Optional

import torch
from torch import nn
from torch.utils.data import Dataset
from datasets import Dataset as HFDataset
from transformers import (
    AutoTokenizer,
    AutoModel,
    get_linear_schedule_with_warmup,
    set_seed
)
from transformers import logging as hf_logging

hf_logging.set_verbosity_error()

# Multi-task classification model: shared encoder + two heads
class MultiTaskClassifier(nn.Module):
    def __init__(self, base_model_name: str, num_labels_urgency: int, num_labels_category: int, dropout: float = 0.2):
        super().__init__()
        self.encoder = AutoModel.from_pretrained(base_model_name)
        hidden_size = self.encoder.config.hidden_size
        self.dropout = nn.Dropout(dropout)
        self.urgency_head = nn.Linear(hidden_size, num_labels_urgency)
        self.category_head = nn.Linear(hidden_size, num_labels_category)

    def forward(self, input_ids, attention_mask):
        outputs = self.encoder(input_ids=input_ids, attention_mask=attention_mask)
        pooled = outputs.last_hidden_state[:, 0]  # CLS token representation
        pooled = self.dropout(pooled)
        urgency_logits = self.urgency_head(pooled)
        category_logits = self.category_head(pooled)
        return urgency_logits, category_logits

@dataclass
class LabelMaps:
    urgency2id: Dict[str, int]
    id2urgency: Dict[int, str]
    category2id: Dict[str, int]
    id2category: Dict[int, str]


def build_label_maps(df: pd.DataFrame) -> LabelMaps:
    urgency_labels = sorted(df['urgency'].dropna().unique())
    category_labels = sorted(df['category'].dropna().unique())
    urgency2id = {l: i for i, l in enumerate(urgency_labels)}
    category2id = {l: i for i, l in enumerate(category_labels)}
    return LabelMaps(
        urgency2id=urgency2id,
        id2urgency={i: l for l, i in urgency2id.items()},
        category2id=category2id,
        id2category={i: l for l, i in category2id.items()},
    )

class IssueDataset(Dataset):
    def __init__(self, hf_dataset: HFDataset):
        self.ds = hf_dataset
    def __len__(self):
        return len(self.ds)
    def __getitem__(self, idx):
        item = self.ds[idx]
        return {k: torch.tensor(v) for k, v in item.items() if k in ['input_ids', 'attention_mask', 'urgency_label', 'category_label']}


def tokenize_and_encode(df: pd.DataFrame, tokenizer, label_maps: LabelMaps, max_length: int):
    texts = df['text'].astype(str).tolist()
    encodings = tokenizer(texts, truncation=True, padding=True, max_length=max_length)
    urgency_label = [label_maps.urgency2id[u] for u in df['urgency']]
    category_label = [label_maps.category2id[c] for c in df['category']]
    hf_dict = {
        'input_ids': encodings['input_ids'],
        'attention_mask': encodings['attention_mask'],
        'urgency_label': urgency_label,
        'category_label': category_label
    }
    return HFDataset.from_dict(hf_dict)


def split_dataframe(df: pd.DataFrame, train_ratio: float = 0.8, seed: int = 42):
    df = df.sample(frac=1, random_state=seed).reset_index(drop=True)
    n_train = int(len(df) * train_ratio)
    train_df = df.iloc[:n_train].reset_index(drop=True)
    eval_df = df.iloc[n_train:].reset_index(drop=True)
    return train_df, eval_df


def compute_metrics(preds_u, labels_u, preds_c, labels_c):
    from sklearn.metrics import accuracy_score, f1_score
    metrics = {}
    metrics['urgency_acc'] = float(accuracy_score(labels_u, preds_u))
    metrics['urgency_f1'] = float(f1_score(labels_u, preds_u, average='weighted'))
    metrics['category_acc'] = float(accuracy_score(labels_c, preds_c))
    metrics['category_f1'] = float(f1_score(labels_c, preds_c, average='weighted'))
    return metrics


def train(args):
    set_seed(args.seed)
    df = pd.read_csv(args.data)
    required_cols = {'text', 'urgency', 'category'}
    if not required_cols.issubset(df.columns):
        raise ValueError(f"CSV must contain columns: {required_cols}")
    df = df.dropna(subset=['text', 'urgency', 'category']).reset_index(drop=True)

    label_maps = build_label_maps(df)

    train_df, eval_df = split_dataframe(df, train_ratio=args.train_ratio, seed=args.seed)

    tokenizer = AutoTokenizer.from_pretrained(args.model)

    train_hf = tokenize_and_encode(train_df, tokenizer, label_maps, args.max_length)
    eval_hf = tokenize_and_encode(eval_df, tokenizer, label_maps, args.max_length)

    train_dataset = IssueDataset(train_hf)
    eval_dataset = IssueDataset(eval_hf)

    model = MultiTaskClassifier(
        base_model_name=args.model,
        num_labels_urgency=len(label_maps.urgency2id),
        num_labels_category=len(label_maps.category2id),
        dropout=args.dropout
    )

    device = torch.device('cuda' if torch.cuda.is_available() and not args.cpu else 'cpu')
    model.to(device)

    optimizer = torch.optim.AdamW(model.parameters(), lr=args.lr, weight_decay=args.weight_decay)

    train_loader = torch.utils.data.DataLoader(train_dataset, batch_size=args.batch_size, shuffle=True)
    eval_loader = torch.utils.data.DataLoader(eval_dataset, batch_size=args.batch_size)

    total_steps = len(train_loader) * args.epochs
    scheduler = get_linear_schedule_with_warmup(optimizer, num_warmup_steps=int(total_steps * 0.1), num_training_steps=total_steps)

    ce_loss = nn.CrossEntropyLoss()

    best_metric = -1.0
    os.makedirs(args.out, exist_ok=True)

    for epoch in range(1, args.epochs + 1):
        model.train()
        total_train_loss = 0.0
        for batch in train_loader:
            optimizer.zero_grad()
            input_ids = batch['input_ids'].to(device)
            attention_mask = batch['attention_mask'].to(device)
            urgency_labels = batch['urgency_label'].to(device)
            category_labels = batch['category_label'].to(device)

            urgency_logits, category_logits = model(input_ids=input_ids, attention_mask=attention_mask)
            loss_u = ce_loss(urgency_logits, urgency_labels)
            loss_c = ce_loss(category_logits, category_labels)
            loss = loss_u + loss_c
            loss.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
            optimizer.step()
            scheduler.step()
            total_train_loss += loss.item()
        avg_train_loss = total_train_loss / max(1, len(train_loader))

        model.eval()
        all_u_preds, all_u_labels = [], []
        all_c_preds, all_c_labels = [], []
        with torch.no_grad():
            for batch in eval_loader:
                input_ids = batch['input_ids'].to(device)
                attention_mask = batch['attention_mask'].to(device)
                urgency_labels = batch['urgency_label'].to(device)
                category_labels = batch['category_label'].to(device)
                urgency_logits, category_logits = model(input_ids=input_ids, attention_mask=attention_mask)
                u_preds = urgency_logits.argmax(dim=-1).cpu().tolist()
                c_preds = category_logits.argmax(dim=-1).cpu().tolist()
                all_u_preds.extend(u_preds)
                all_c_preds.extend(c_preds)
                all_u_labels.extend(urgency_labels.cpu().tolist())
                all_c_labels.extend(category_labels.cpu().tolist())
        metrics = compute_metrics(all_u_preds, all_u_labels, all_c_preds, all_c_labels)
        print(f"Epoch {epoch}: train_loss={avg_train_loss:.4f} | "
              f"urgency_acc={metrics['urgency_acc']:.3f} f1={metrics['urgency_f1']:.3f} | "
              f"category_acc={metrics['category_acc']:.3f} f1={metrics['category_f1']:.3f}")

        score = metrics['urgency_f1'] + metrics['category_f1']
        if score > best_metric:
            best_metric = score
            save_path = os.path.join(args.out, 'best.pt')
            torch.save({
                'model_state_dict': model.state_dict(),
                'label_maps': label_maps,
                'base_model': args.model,
                'tokenizer': args.model,
                'metrics': metrics
            }, save_path)
            print(f"Saved new best model -> {save_path}")

    # Export tokenizer + config for later loading
    tokenizer.save_pretrained(args.out)
    print("Training complete. Best combined F1:", best_metric)


def predict_texts(model_dir: str, texts: List[str]):
    checkpoint = torch.load(os.path.join(model_dir, 'best.pt'), map_location='cpu')
    base_model = checkpoint['base_model']
    label_maps: LabelMaps = checkpoint['label_maps']
    tokenizer = AutoTokenizer.from_pretrained(checkpoint['tokenizer'])
    model = MultiTaskClassifier(base_model, len(label_maps.urgency2id), len(label_maps.category2id))
    model.load_state_dict(checkpoint['model_state_dict'])
    model.eval()
    enc = tokenizer(texts, truncation=True, padding=True, max_length=256, return_tensors='pt')
    with torch.no_grad():
        u_logits, c_logits = model(enc['input_ids'], enc['attention_mask'])
        u_ids = u_logits.argmax(dim=-1).tolist()
        c_ids = c_logits.argmax(dim=-1).tolist()
    id2u = label_maps.id2urgency
    id2c = label_maps.id2category
    results = []
    for ui, ci in zip(u_ids, c_ids):
        results.append({'urgency': id2u[ui], 'category': id2c[ci]})
    return results


def parse_args():
    parser = argparse.ArgumentParser(description='Train multi-task issue classifier (urgency + category).')
    parser.add_argument('--data', type=str, required=True, help='Path to labeled CSV file.')
    parser.add_argument('--model', type=str, default='distilbert-base-uncased', help='Base transformer model.')
    parser.add_argument('--out', type=str, required=True, help='Output directory for model artifacts.')
    parser.add_argument('--epochs', type=int, default=3)
    parser.add_argument('--batch_size', type=int, default=8)
    parser.add_argument('--lr', type=float, default=5e-5)
    parser.add_argument('--weight_decay', type=float, default=0.01)
    parser.add_argument('--dropout', type=float, default=0.2)
    parser.add_argument('--train_ratio', type=float, default=0.85)
    parser.add_argument('--max_length', type=int, default=256)
    parser.add_argument('--seed', type=int, default=42)
    parser.add_argument('--cpu', action='store_true', help='Force CPU even if CUDA available.')
    return parser.parse_args()

if __name__ == '__main__':
    args = parse_args()
    train(args)
