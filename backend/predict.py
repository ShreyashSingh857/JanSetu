import os
import torch
from typing import List, Dict
from transformers import AutoTokenizer, AutoModel
import sys

class MultiTaskPredictor:
    def __init__(self, model_dir: str):
        checkpoint_path = os.path.join(model_dir, 'best.pt')
        if not os.path.exists(checkpoint_path):
            raise FileNotFoundError(f"Model checkpoint not found at {checkpoint_path}. Train model first.")
        checkpoint = torch.load(checkpoint_path, map_location='cpu')
        self.label_maps = checkpoint['label_maps']
        base_model = checkpoint['base_model']
        self.tokenizer = AutoTokenizer.from_pretrained(checkpoint['tokenizer'])
        # Rebuild architecture
        from ml.train_multitask import MultiTaskClassifier  # type: ignore
        self.model = MultiTaskClassifier(base_model, len(self.label_maps.urgency2id), len(self.label_maps.category2id))
        self.model.load_state_dict(checkpoint['model_state_dict'])
        self.model.eval()

    def predict(self, texts: List[str]) -> List[Dict[str, str]]:
        enc = self.tokenizer(texts, truncation=True, padding=True, max_length=256, return_tensors='pt')
        with torch.no_grad():
            u_logits, c_logits = self.model(enc['input_ids'], enc['attention_mask'])
            u_ids = u_logits.argmax(dim=-1).tolist()
            c_ids = c_logits.argmax(dim=-1).tolist()
        id2u = self.label_maps.id2urgency
        id2c = self.label_maps.id2category
        return [
            {
                'urgency': id2u[u],
                'category': id2c[c]
            } for u, c in zip(u_ids, c_ids)
        ]

if __name__ == '__main__':
    model_dir = sys.argv[1]
    text = " ".join(sys.argv[2:]) or "Broken road causing traffic jams"
    predictor = MultiTaskPredictor(model_dir)
    print(predictor.predict([text]))
