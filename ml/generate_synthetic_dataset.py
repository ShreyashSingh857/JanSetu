import json, random, csv, os, hashlib
from datetime import datetime

random.seed(42)

URGENCY = ["urgent", "normal"]
CATEGORIES = ["road", "sanitation", "water", "electricity", "health", "other"]

TEMPLATES = {
    "road": [
        "Large pothole near {place} causing accidents",
        "Road surface broken and creating traffic jam at {place}",
        "Faded lane markings on busy junction at {place}",
        "Construction debris blocking part of the road at {place}",
        "Damaged speed breaker making vehicles jump at {place}"
    ],
    "sanitation": [
        "Garbage pile not collected for days near {place}",
        "Overflowing dustbin causing smell at {place}",
        "Open waste dumping spotted behind {place}",
        "Blocked drain causing stagnant water at {place}",
        "Litter scattered around market area near {place}"
    ],
    "water": [
        "Water leakage from main pipeline at {place}",
        "No water supply in houses near {place} since morning",
        "Contaminated muddy water coming from tap at {place}",
        "Broken public tap wasting water at {place}",
        "Low pressure water supply reported around {place}"
    ],
    "electricity": [
        "Street light not working at {place}",
        "Frequent power cuts happening near {place}",
        "Electric pole wires hanging dangerously at {place}",
        "Transformer making loud noise near {place}",
        "Voltage fluctuation damaging appliances around {place}"
    ],
    "health": [
        "Open sewage causing foul smell near {place}",
        "Mosquito breeding due to stagnant water at {place}",
        "Medical waste dumped openly behind {place}",
        "Dog bite incident reported at {place}",
        "Unhygienic conditions around public clinic at {place}"
    ],
    "other": [
        "Illegal parking blocking access near {place}",
        "Noise complaint due to loud speakers at {place}",
        "Broken public bench near {place}",
        "Vandalized signboard at {place}",
        "Unauthorized street vendor congestion at {place}"
    ]
}

PLACES = [
    "Main Square", "Central Park", "Bus Stand", "Railway Crossing", "Old Market",
    "Community Hall", "River Bridge", "School Gate", "Hospital Road", "Temple Street",
    "Library Circle", "Stadium Entrance", "Ward 14", "Sector 9", "Green Avenue"
]

def urgency_from_text(text: str) -> str:
    urgent_keywords = ["accident", "danger", "leak", "sewage", "stagnant", "dog bite", "hanging", "overflow", "contaminated", "blocked drain"]
    lower = text.lower()
    for k in urgent_keywords:
        if k in lower:
            return "urgent"
    return random.choice(["urgent", "normal", "normal"])  # biased toward normal


def generate_samples(per_category: int = 60):
    samples = []
    for cat in CATEGORIES:
        patterns = TEMPLATES[cat]
        for _ in range(per_category):
            template = random.choice(patterns)
            place = random.choice(PLACES)
            text = template.format(place=place)
            urgency = urgency_from_text(text)
            uid = hashlib.md5(f"{cat}-{text}".encode()).hexdigest()[:10]
            samples.append({
                "id": uid,
                "text": text,
                "urgency": urgency,
                "category": cat
            })
    random.shuffle(samples)
    return samples


def main():
    out_json = "data/annotated/issues_synthetic.json"
    out_csv = "data/annotated/issues_synthetic.csv"
    os.makedirs("data/annotated", exist_ok=True)
    samples = generate_samples(per_category=60)  # 6 categories * 60 = 360 rows
    with open(out_json, 'w', encoding='utf-8') as f:
        json.dump({
            "generated_at": datetime.utcnow().isoformat(),
            "num_samples": len(samples),
            "classes": {"urgency": URGENCY, "category": CATEGORIES},
            "data": samples
        }, f, ensure_ascii=False, indent=2)
    with open(out_csv, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=["id", "text", "urgency", "category"])
        writer.writeheader()
        writer.writerows(samples)
    print(f"Wrote {len(samples)} samples -> {out_json} & {out_csv}")

if __name__ == "__main__":
    main()
