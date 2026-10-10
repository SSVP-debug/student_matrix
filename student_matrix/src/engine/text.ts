const STOP = new Set('a an the and or but if then else of to in on at by for with from as is are was were be been being it its this that these those he she they we you i not no do does did have has had will would can could should may might about into over under than so such also very more most other some any each which who whom what when where why how there their them his her our your my me us up out off just only own same too s t'.split(' '));

export const tokenize = (s: string): string[] =>
  s.toLowerCase().replace(/[^a-z0-9+#\s]/g, ' ').split(/\s+/).filter((w) => w.length > 1 && !STOP.has(w)).map(stem);

// Very light stemmer: enough for BM25 matching without a dictionary.
const stem = (w: string): string =>
  w.length > 5 && w.endsWith('ing') ? w.slice(0, -3) : w.length > 4 && w.endsWith('ed') ? w.slice(0, -2) :
  w.length > 4 && w.endsWith('es') ? w.slice(0, -2) : w.length > 3 && w.endsWith('s') && !w.endsWith('ss') ? w.slice(0, -1) : w;

export const splitSentences = (text: string): string[] =>
  text.replace(/\s+/g, ' ').split(/(?<=[.!?])\s+(?=[A-Z0-9"(])/).map((s) => s.trim()).filter((s) => s.length > 25 && s.length < 400);

export interface Doc { id: string; title: string; text: string; subject: string; kind: 'card' | 'question' | 'note'; ref?: string }

/** Okapi BM25 over a small in-memory corpus. Runs in milliseconds on low-end phones. */
export class Index {
  private toks: string[][];
  private df = new Map<string, number>();
  private avg = 1;
  constructor(public docs: Doc[]) {
    this.toks = docs.map((d) => tokenize(d.title + ' ' + d.text));
    this.toks.forEach((t) => new Set(t).forEach((w) => this.df.set(w, (this.df.get(w) ?? 0) + 1)));
    this.avg = this.toks.reduce((a, t) => a + t.length, 0) / Math.max(1, this.toks.length);
  }
  search(query: string, k = 5): { doc: Doc; score: number }[] {
    const q = [...new Set(tokenize(query))];
    const N = this.docs.length;
    const out: { doc: Doc; score: number }[] = [];
    this.toks.forEach((t, i) => {
      let score = 0;
      const len = t.length;
      for (const w of q) {
        const f = t.reduce((a, x) => (x === w ? a + 1 : a), 0);
        if (!f) continue;
        const n = this.df.get(w) ?? 0;
        const idf = Math.log(1 + (N - n + 0.5) / (n + 0.5));
        score += idf * ((f * 2.2) / (f + 1.2 * (0.25 + 0.75 * (len / this.avg))));
      }
      if (score > 0) out.push({ doc: this.docs[i], score });
    });
    return out.sort((a, b) => b.score - a.score).slice(0, k);
  }
}
