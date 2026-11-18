// PUESTA EN ESCENA automática: los personajes caminan e interactúan con el decorado cuando el guion lo pide.
// 1) Si una frase NOMBRA algo del escenario (palabras `claves` de sus `puntos`, en escenarios-datos.ts), un
//    personaje camina hasta allí y, al llegar, lo mira, lo señala o se queda pensando delante (pose del punto).
// 2) Si no, al empezar algunas frases alguien cambia de sitio (a otro punto de interés libre) para que la escena
//    no se quede quieta. Se turnan, no se pisan ni se tapan, y nunca se mueven en las palabras donde la idea ya
//    les manda hacer algo (posturas, saltos…).
// 3) A mano: { en: "map", hace: "va", a: "escritorio" } lleva a ese personaje a ese punto.
// Se desactiva con `paseo: false` en la escena o `extra: { quieto: true }` en un actor; si el actor ya tiene
// alguna acción «mueve», se respeta su recorrido (pero sí hace sus «va»).
import { azar } from "./azar";
import { DATOS, PuntoInteres } from "./escenarios-datos";
import { FPS } from "./tiempo";
import { Accion, Actor, Escena, Palabra } from "./tipos";

const PERSONAS = new Set(["bent", "marinero", "capitan", "rey", "cientifico", "millonario", "agente", "sovietico", "inventor", "almirante", "churchill"]);
const limpia = (t: string) => t.toLowerCase().replace(/[^a-z0-9]/g, "");
const VELOCIDAD = 1.5; // m/s andando

export function puestaEnEscena(e: Escena, palabras: Palabra[], ini: number, fin: number, semilla: number): Escena {
  const esc = DATOS[e.escenario];
  const puntos = Object.entries(esc.puntos ?? {});
  const actores = e.actores ?? [];
  const pos = actores.map((a) => ({ x: a.x, z: a.z ?? 0.4 }));
  const nuevos = actores.map((a) => ({ ...a, acciones: [...(a.acciones ?? [])] as Accion[] }));

  /** índice de la palabra a la que apunta una acción (aprox., por texto) */
  const indice = (en: Accion["en"]): number => {
    if (typeof en === "number") return en;
    const [txt, vez] = String(en).split("#");
    let n = Number(vez || 1);
    for (let k = ini; k < fin; k++) if (limpia(palabras[k].p) === limpia(txt) && --n === 0) return k;
    return -1;
  };
  /** primera palabra que suena después de `seg` segundos desde la palabra i */
  const palabraTras = (i: number, seg: number) => {
    const t = (palabras[i]?.ini ?? 0) + seg;
    for (let k = i; k < fin; k++) if (palabras[k].ini >= t) return k;
    return fin - 1;
  };
  const ocupadas = actores.map((a) => {
    const set = new Set<number>();
    for (const ac of a.acciones ?? []) {
      if (ac.hace === "mira" || ac.hace === "cara" || ac.hace === "habla" || ac.hace === "va") continue;
      const idx = indice(ac.en);
      if (idx >= 0) for (let d = -1; d <= 2; d++) set.add(idx + d);
    }
    // quien entra más tarde no puede moverse antes de entrar ni nada más aparecer
    if (a.entra?.en !== undefined) {
      const e0 = indice(a.entra.en);
      for (let k = ini; k <= e0 + 4; k++) set.add(k);
    }
    return set;
  });
  const enCamino = actores.map(() => -1); // hasta qué palabra está ocupado andando/interactuando

  /** Manda al actor i al punto p desde la palabra m. Devuelve false si no puede. */
  /** ¿El camino de a hasta b pasa por delante o por detrás de otro personaje? (en cámara se cruzarían) */
  const cruza = (i: number, a: { x: number; z: number }, b: { x: number; z: number }) =>
    pos.some((o, j) => {
      if (j === i) return false;
      for (let k = 1; k <= 10; k++) {
        const t = k / 10;
        const x = a.x + (b.x - a.x) * t;
        const z = a.z + (b.z - a.z) * t;
        if (Math.abs(x - o.x) * 1.4 < 0.22 && Math.abs(z - o.z) < 0.6) return true;
      }
      return false;
    });

  const ir = (i: number, p: PuntoInteres, m: number, siguiente: number): boolean => {
    const yo = pos[i];
    if (cruza(i, yo, p)) return false;
    const dm = Math.hypot((p.x - yo.x) * esc.ancho, (p.z - yo.z) * esc.fondo);
    if (dm < 0.4) {
      // ya está allí: solo interactúa
      nuevos[i].acciones.push({ en: m, hace: "mira", lado: p.mira }, { en: m, hace: "pose", pose: p.pose ?? "mira", hasta: Math.max(m + 2, siguiente) });
      enCamino[i] = Math.max(m + 2, siguiente);
      return true;
    }
    const dura = Math.round(Math.min(80, Math.max(22, (dm / VELOCIDAD) * FPS)));
    const llega = Math.min(fin - 1, palabraTras(m, dura / FPS));
    nuevos[i].acciones.push(
      { en: m, hace: "mira", lado: p.x >= yo.x ? 1 : -1 },
      { en: m, hace: "pose", pose: "camina", hasta: llega },
      { en: m, hace: "mueve", a: { x: p.x, z: p.z }, dura },
      { en: llega, hace: "mira", lado: p.mira },
      { en: llega, hace: "pose", pose: p.pose ?? "mira", hasta: Math.max(llega + 3, siguiente) },
    );
    pos[i] = { x: p.x, z: p.z };
    enCamino[i] = Math.max(llega + 3, siguiente);
    return true;
  };
  const libre = (p: PuntoInteres, yo: number) => pos.every((o, j) => j === yo || Math.min(Math.abs(p.x - o.x) * 1.4, Math.hypot(p.x - o.x, p.z - o.z)) > 0.3);

  // 3) acciones «va» escritas en la idea (siempre)
  actores.forEach((a, i) => {
    for (const ac of a.acciones ?? []) {
      if (ac.hace !== "va") continue;
      const p = esc.puntos?.[ac.a];
      const m = indice(ac.en);
      if (p && m >= 0) ir(i, p, m, m + 6);
    }
  });
  if (e.paseo === false) return { ...e, actores: nuevos };

  const moviles = actores
    .map((a, i) => ({ a, i }))
    .filter(({ a }) => PERSONAS.has(a.tipo) && a.extra?.quieto !== true && !(a.acciones ?? []).some((ac) => ac.hace === "mueve" || ac.hace === "va"));
  if (!moviles.length) return { ...e, actores: nuevos };

  // frases de la escena (de inicio de frase a inicio de frase)
  const frases: number[] = [ini];
  for (let k = ini + 1; k < fin; k++) if (/[.!?]$/.test(palabras[k - 1].p)) frases.push(k);
  frases.push(fin);

  let ultimoPaseo = ini;
  for (let f = 0; f < frases.length - 1; f++) {
    const a0 = frases[f];
    const a1 = frases[f + 1];
    const siguiente = Math.min(fin - 1, a1);
    // ¿la frase nombra algo del decorado?
    let objetivo: { p: PuntoInteres; m: number } | null = null;
    for (let k = a0; k < a1 && !objetivo; k++) {
      const w = limpia(palabras[k].p);
      const hit = puntos.find(([, p]) => p.claves.includes(w));
      if (hit) objetivo = { p: hit[1], m: k - a0 <= 3 ? a0 : k };
    }
    const elige = (m: number, p?: PuntoInteres) => {
      // si la frase nombra un objeto, va primero quien habla (narra); si es un paseo, el que lleva más tiempo quieto
      const narra = (x: { a: Actor }) => (x.a.extra?.narra === true ? 0 : 1);
      const orden = [...moviles].sort((u, v) => (p ? narra(u) - narra(v) : 0) || enCamino[u.i] - enCamino[v.i] || u.i - v.i);
      return orden.find(({ i }) => !ocupadas[i].has(m) && enCamino[i] < m && (!p || libre(p, i)));
    };
    if (objetivo && f > 0) {
      // (en la primera frase, el gancho, nadie se va: el foco está en la pregunta)
      const quien = elige(objetivo.m, objetivo.p);
      if (quien && ir(quien.i, objetivo.p, objetivo.m, siguiente)) {
        ultimoPaseo = objetivo.m;
        continue;
      }
    }
    // 2) paseo para que la escena no se quede quieta (cada ~6 palabras como mínimo)
    if (f === 0 || a0 - ultimoPaseo < 6) continue;
    const quien = elige(a0);
    if (!quien) continue;
    const candidatos = puntos.map(([, p]) => p).filter((p) => libre(p, quien.i) && Math.hypot(p.x - pos[quien.i].x, p.z - pos[quien.i].z) > 0.25);
    if (candidatos.length) {
      const p = candidatos[Math.floor(azar(semilla, "pp", f) * candidatos.length)];
      // en paseos sin motivo no se aleja demasiado (que siga en plano)
      if (Math.hypot((p.x - pos[quien.i].x) * esc.ancho, (p.z - pos[quien.i].z) * esc.fondo) < 5 && ir(quien.i, p, a0, siguiente)) ultimoPaseo = a0;
    } else {
      // sin puntos libres: un par de pasos a un sitio despejado
      for (let intento = 0; intento < 24; intento++) {
        const x = 0.15 + azar(semilla, "px", f, intento) * 0.7;
        const z = 0.2 + azar(semilla, "pz", f, intento) * 0.55;
        const p: PuntoInteres = { x, z, mira: x < 0.5 ? 1 : -1, pose: "brazos", claves: [] };
        if (libre(p, quien.i) && Math.hypot(x - pos[quien.i].x, z - pos[quien.i].z) > 0.18) {
          if (ir(quien.i, p, a0, siguiente)) ultimoPaseo = a0;
          break;
        }
      }
    }
  }
  return { ...e, actores: nuevos };
}
