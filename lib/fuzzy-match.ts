interface FuzzyResult {
  match: boolean;
  score: number;
}

export function fuzzyMatch(query: string, target: string): FuzzyResult {
  if (!query) return { match: true, score: 0 };

  const q = query.toLowerCase();
  const t = target.toLowerCase();

  if (t.includes(q)) {
    const bonus = t.startsWith(q) ? 10 : 0;
    return { match: true, score: 100 + bonus - q.length };
  }

  let qi = 0;
  let score = 0;
  let consecutive = 0;
  let lastMatchIndex = -2;

  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) {
      qi++;
      score += 10;

      // Bonus for consecutive matches
      if (ti === lastMatchIndex + 1) {
        consecutive++;
        score += consecutive * 5;
      } else {
        consecutive = 0;
      }

      // Bonus for word boundary match
      if (ti === 0 || t[ti - 1] === ' ' || t[ti - 1] === '-' || t[ti - 1] === '_') {
        score += 15;
      }

      lastMatchIndex = ti;
    }
  }

  if (qi < q.length) return { match: false, score: 0 };
  return { match: true, score };
}

export function fuzzyFilter<T>(
  items: T[],
  query: string,
  getLabel: (item: T) => string
): T[] {
  if (!query) return items;

  const scored = items
    .map((item) => ({ item, ...fuzzyMatch(query, getLabel(item)) }))
    .filter((r) => r.match)
    .sort((a, b) => b.score - a.score);

  return scored.map((r) => r.item);
}
