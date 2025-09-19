import pandas as pd
import os, json, hashlib
from datetime import datetime

SYN_PATH = 'data/annotated/issues_synthetic.csv'
REAL_PATH = 'data/annotated/issues_real_placeholder.csv'  # replace with actual later
OUT_CSV = 'data/annotated/issues_mixed.csv'
OUT_JSON = 'data/annotated/issues_mixed.json'

REQUIRED = {'id','text','urgency','category'}

def load_csv(path):
    if not os.path.exists(path):
        return pd.DataFrame(columns=list(REQUIRED)+['source'])
    df = pd.read_csv(path)
    # ensure required
    missing = REQUIRED - set(df.columns)
    if missing:
        raise ValueError(f"Missing columns {missing} in {path}")
    if 'source' not in df.columns:
        df['source'] = 'synthetic' if 'synthetic' in path else 'real'
    return df

def normalize(df):
    df['text'] = df['text'].astype(str).str.strip()
    df['urgency'] = df['urgency'].str.lower()
    df['category'] = df['category'].str.lower()
    return df

def dedupe(df):
    df['hash'] = df['text'].apply(lambda t: hashlib.sha1(t.lower().encode()).hexdigest())
    before = len(df)
    df = df.drop_duplicates(subset=['hash']).drop(columns=['hash'])
    removed = before - len(df)
    return df, removed

def main():
    syn = load_csv(SYN_PATH)
    real = load_csv(REAL_PATH)
    syn['source'] = 'synthetic'
    real['source'] = 'real'

    # unify columns
    cols = ['id','text','urgency','category','source']
    syn = syn[cols]
    real = real[cols]

    df = pd.concat([real, syn], ignore_index=True)
    df = normalize(df)
    df, removed = dedupe(df)

    # simple stats
    stats = {
        'total': len(df),
        'removed_duplicates': removed,
        'by_source': df.groupby('source').size().to_dict(),
        'urgency_counts': df.groupby('urgency').size().to_dict(),
        'category_counts': df.groupby('category').size().to_dict(),
    }

    os.makedirs(os.path.dirname(OUT_CSV), exist_ok=True)
    df.to_csv(OUT_CSV, index=False)
    with open(OUT_JSON, 'w', encoding='utf-8') as f:
        json.dump({
            'generated_at': datetime.utcnow().isoformat(),
            'stats': stats,
            'data': df.to_dict(orient='records')
        }, f, ensure_ascii=False, indent=2)

    print(f"Wrote mixed dataset -> {OUT_CSV} ({len(df)} rows)")
    print(json.dumps(stats, indent=2))

if __name__ == '__main__':
    main()
