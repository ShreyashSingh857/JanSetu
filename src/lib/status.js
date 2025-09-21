// Central status normalization used across UI layers
// Ensures legacy 'Reported' is treated as 'Pending' internally if needed.

export function normalizeStatus(raw) {
  if (!raw) return 'Pending';
  if (raw === 'Reported') return 'Pending';
  return raw;
}

export function isOpenStatus(status) {
  const s = normalizeStatus(status);
  return s === 'Pending' || s === 'In Progress';
}

export function isResolved(status) {
  return normalizeStatus(status) === 'Resolved';
}
