// Estado de cada personaje en un fotograma: dónde está (anda hasta donde le dicen), qué postura y qué cara pone,
// si habla y qué signo lleva. Todo calculado desde las palabras del guion (sin hooks: lo usan el vídeo y la cámara).
import { Anim, Expresion, poseCompleta } from "../personaje/animaciones";
import { caraReparto } from "../personaje/figura";
import { Pose as PoseDibujo } from "../personaje/pose";
import type { Signo } from "../personaje/signos";
import { LUGARES, SUELO } from "../mundo/ciudad";
import { Actor, Cara, Escena, Palabra, Pose } from "./tipos";
import { FPS, indicePalabra } from "./tiempo";

export const ESCALA = 0.4; // tamaño de una persona en el mundo (950 unidades → ~300 px)
export const ALTO_PERSONA = 950 * ESCALA;

export const ANIM: Record<Pose, Anim> = {
  bolsillos: "quieto", brazos: "habla", camina: "camina", corre: "corre", senala: "senala", piensa: "piensa", encoge: "encoge",
  saluda: "saluda", victoria: "victoria", asustado: "asustado", cruza: "cruza", salta: "salta", mira: "mira", cabeza: "cabeza", agotado: "agotado",
};
const EXPRESION: Record<Cara, Expresion> = {
  normal: "seria", chulo: "chulo", enfadado: "enfadado", feliz: "feliz", risa: "risa", sorpresa: "sorpresa", asustado: "asustado",
  triste: "triste", piensa: "piensa", dormido: "dormido", aburrido: "aburrido",
};

export type EstadoActor = { x: number; y: number; esc: number; mira: 1 | -1; pose: PoseDibujo; signo: { s: Signo; t: number } | null; visible: boolean };

/** Ctx de una escena: sus palabras y en qué fotograma (absoluto) empieza. */
export type CtxEscena = { palabras: Palabra[]; base: number; ini: number; fin: number };

/** F(en) = fotograma ABSOLUTO en que se dice esa palabra (buscando desde el principio de la escena). */
export const Fde = (c: CtxEscena) => (en: number | string) => Math.round(c.palabras[indicePalabra(c.palabras, en, c.base)].ini * FPS);

const sonando = (c: CtxEscena, f: number) => c.palabras.some((p) => f / FPS >= p.ini && f / FPS <= p.fin);

/** Boca al hablar: se abre y cierra de forma irregular. */
const abreBoca = (f: number, s: number) => Math.min(1, Math.abs(Math.sin(f * 0.85 + s) * 0.6 + Math.sin(f * 1.37 + s * 2) * 0.4) * 1.1);

export function estadoActor(a: Actor, i: number, e: Escena, c: CtxEscena, f: number, variante: number): EstadoActor {
  const F = Fde(c);
  const semilla = (variante * 31 + i * 7) % 100;
  const fondo = a.fondo ?? 0.4;
  const y = SUELO + 40 + fondo * 120;
  const esc = ESCALA * (1.12 - fondo * 0.28);
  let x = LUGARES[e.lugar].x + (a.x ?? 0);
  let mira: 1 | -1 = a.mira ?? 1;
  let pose: Pose = a.pose ?? "bolsillos";
  let poseAnt: Pose = pose;
  let tPose = f - c.ini + 30;
  let cara: Cara = a.cara ?? "normal";
  let habla = !!a.narra && sonando(c, f);
  let signo: EstadoActor["signo"] = null;
  // entrada en escena
  let visible = true;
  if (a.entra) {
    const fe = F(a.entra.en);
    if (f < fe) visible = false;
    else if (a.entra.desde !== "pop") {
      const k = Math.min(1, (f - fe) / 24);
      x += (a.entra.desde === "izq" ? -1 : 1) * 700 * (1 - k);
      if (k < 1) {
        pose = "camina";
        mira = a.entra.desde === "izq" ? 1 : -1;
      }
    }
  }
  const acciones = [...(a.acciones ?? [])].sort((p, q) => F(p.en) - F(q.en));
  for (const ac of acciones) {
    const fa = F(ac.en);
    if (f < fa) break;
    switch (ac.hace) {
      case "cara":
        cara = ac.cara;
        break;
      case "pose": {
        const fin = ac.hasta !== undefined ? F(ac.hasta) : Infinity;
        if (f < fin) {
          poseAnt = pose;
          pose = ac.pose;
          tPose = f - fa;
        } else {
          poseAnt = ac.pose;
          tPose = f - fin;
        }
        break;
      }
      case "habla": {
        const fin = ac.hasta !== undefined ? F(ac.hasta) : fa + 45;
        if (f < fin) habla = true;
        break;
      }
      case "signo": {
        const fin = ac.hasta !== undefined ? F(ac.hasta) : fa + 66;
        if (f <= fin) signo = { s: ac.signo, t: f - fa };
        break;
      }
      case "mira":
        mira = ac.lado;
        break;
      case "va": {
        const destino = LUGARES[e.lugar].x + ac.x;
        const vel = ac.corre ? 18 : 8; // px por fotograma
        const dur = Math.max(1, Math.abs(destino - x) / vel);
        const k = Math.min(1, (f - fa) / dur);
        const lado = destino >= x ? 1 : -1;
        if (k < 1) {
          poseAnt = pose;
          pose = ac.corre ? "corre" : "camina";
          tPose = f - fa;
          mira = lado;
        } else {
          tPose = f - fa - dur;
          poseAnt = ac.corre ? "corre" : "camina";
        }
        x = x + (destino - x) * k;
        break;
      }
    }
  }
  const abre = habla ? abreBoca(f, semilla) : 0;
  let anim = ANIM[pose];
  let animAnt = ANIM[poseAnt];
  if (anim === "quieto" && habla) {
    anim = "habla";
    animAnt = "quieto";
    tPose = 30;
  }
  const p0 = poseCompleta({ anim, animAnt, t: tPose, expresion: EXPRESION[cara], abre, semilla, f });
  return { x, y, esc, mira, pose: { ...p0, ...caraReparto(EXPRESION[cara], abre, f + semilla) } as PoseDibujo, signo, visible };
}

/** Punto de la cabeza de un actor en el mundo (para planos «cerca» y para la nube). */
export const cabezaDe = (s: EstadoActor): [number, number] => [s.x, s.y - 820 * s.esc];
