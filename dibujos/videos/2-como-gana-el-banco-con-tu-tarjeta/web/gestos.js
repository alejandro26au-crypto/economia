// GESTOS AL HABLAR (motor de dibujos). Se copia a web/ de cada vídeo (preparar.sh). Funciones puras del fotograma:
//   bocaEn(f, BOCA, base)  -> la cara con la boca según el volumen de la voz: base, base~1 (entreabierta), base~2 (abierta)
//   brazosEn(f, CLAVES)    -> {L, R, Lp, Rp, Lt, Rt}: la pose de cada brazo con su transición viva (impulso y asiento)
//   cabezaEn(f, GOLPES)    -> {headTilt, bob}: asiente en las palabras fuertes y respira siempre
// CLAVES = [{ f, L?, R? }] (en el fotograma de la palabra, la pose de cada brazo; el gesto empieza 3 fotogramas antes)
// GOLPES = [f, f, …] (fotogramas de las palabras fuertes: remates y cifras)
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const q = (x, n = 2) => Math.round(x * 10 ** n) / 10 ** n;
export function bocaEn(f, BOCA, base = 'neutral') {
  const a = BOCA[f] ?? 0;
  return a > 0.78 ? base + '~2' : a > 0.12 ? base + '~1' : base;
}
export function brazosEn(f, CLAVES, dur = 7) {
  let L = 'hang', R = 'hang', Lp = 'hang', Rp = 'hang', Lf = -99, Rf = -99;
  for (const k of CLAVES) {
    const fk = k.f - 3; if (fk > f) break;
    if (k.L && k.L !== L) { Lp = L; L = k.L; Lf = fk; }
    if (k.R && k.R !== R) { Rp = R; R = k.R; Rf = fk; }
  }
  return { L, R, Lp, Rp, Lt: q(clamp((f - Lf) / dur), 2), Rt: q(clamp((f - Rf) / dur), 2) };
}
export function cabezaEn(f, GOLPES) {
  let headTilt = 0;
  for (const g of GOLPES) { const d = f - (g - 2); if (d >= 0 && d < 10) headTilt += -5 * Math.sin((d / 10) * Math.PI) * (1 - d / 14); }
  return { headTilt: q(headTilt, 1), bob: q(Math.sin(f * 0.11) * 0.006, 3) };
}
