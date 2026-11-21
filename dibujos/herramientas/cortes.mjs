// Exporta los planos y los momentos de sonido de un vídeo (para sonido.py):  node ../../herramientas/cortes.mjs > out/cortes.json
import path from 'path';
const S = await import(path.resolve('web/story.js'));
console.log(JSON.stringify({ TOTAL: S.TOTAL, SHOTS: S.SHOTS.map((s) => ({ id: s.id, a: s.a, b: s.b, light: s.light })), SONIDOS: S.SONIDOS || [] }));
