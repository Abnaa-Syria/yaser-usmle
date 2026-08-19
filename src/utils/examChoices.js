export function normalizeMcqChoices(raw, { isAr = false } = {}) {
  if (raw == null) return [];
  let v = raw;
  if (typeof raw === "string") {
    try {
      v = JSON.parse(raw);
    } catch {
      return [];
    }
  }
  if (Array.isArray(v)) {
    if (v.length === 0) return [];
    if (typeof v[0] === "string") {
      return v.map((s) => {
        const text = String(s);
        return { value: text, label: text, id: text };
      });
    }
    return v.map((o, i) => {
      if (o != null && typeof o === "object") {
        const base =
          o.text != null ? String(o.text) : o.label != null ? String(o.label) : String(o.id ?? `${i + 1}`);
        const label = isAr && o.textAr?.trim() ? String(o.textAr) : base;
        const id = o.id != null ? String(o.id) : base;
        const value = o.text != null ? String(o.text) : id;
        return { value, label, id };
      }
      const text = String(o);
      return { value: text, label: text, id: text };
    });
  }
  if (typeof v === "object") {
    return Object.entries(v).map(([, val]) => {
      const text = String(val);
      return { value: text, label: text, id: text };
    });
  }
  return [];
}

function normalizeToken(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

export function choiceMatchesStored(stored, choice) {
  if (stored == null || stored === "") return false;
  const s = String(stored).trim();
  const sn = normalizeToken(s);
  return (
    s === choice.value ||
    s === choice.id ||
    s === choice.label ||
    sn === normalizeToken(choice.id) ||
    sn === normalizeToken(choice.value) ||
    sn === normalizeToken(choice.label)
  );
}

export function choiceIsCorrect(correctAnswer, choice) {
  if (correctAnswer == null || correctAnswer === "") return false;
  const c = String(correctAnswer).trim();
  const cn = normalizeToken(c);
  return (
    c === choice.value ||
    c === choice.id ||
    c === choice.label ||
    cn === normalizeToken(choice.id) ||
    cn === normalizeToken(choice.value) ||
    cn === normalizeToken(choice.label)
  );
}

export function resolveChoiceLabel(stored, choices) {
  if (stored == null || stored === "") return "—";
  const hit = choices.find((c) => choiceMatchesStored(stored, c));
  return hit?.label ?? String(stored);
}
