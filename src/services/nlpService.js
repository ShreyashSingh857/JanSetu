const API_URL = import.meta.env.VITE_NLP_API_URL || 'http://localhost:8001';

export async function classifyIssue(text) {
  const resp = await fetch(`${API_URL}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ texts: [text] })
  });
  if (!resp.ok) {
    throw new Error('NLP service error');
  }
  const data = await resp.json();
  return data.results[0];
}

export async function classifyIssues(texts) {
  const resp = await fetch(`${API_URL}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ texts })
  });
  if (!resp.ok) {
    throw new Error('NLP service error');
  }
  const data = await resp.json();
  return data.results;
}
