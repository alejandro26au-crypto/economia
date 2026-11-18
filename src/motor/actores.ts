// Estado de cada personaje en un fotograma: dónde está (anda hasta donde le dicen), QUÉ DIBUJO toca (según la
// pose y la cara que pide la frase), si habla y qué signo lleva. Todo desde las palabras (sin hooks).
import type { Signo } from "../personaje/signos";
import { DIBUJOS } from "../personaje/poses";
import { alturaCabeza } from "../personaje/Dibujo";
import { LUGARES, SUELO } from "../mundo/ciudad";
import { Actor, Cara, Escena, Palabra, Pose } from "./tipos";
import { FPS, indicePalabra } from "./tiempo";

export type EstadoActor = { x: number; y: number; esc: number; mira: 1 | -1; dibujo: string; tDibujo: number; habla: boolean; moviendo: boolean; signo: { s: Signo; t: number } | null; visible: boolean };

/** Ctx de una escena: sus palabras y en qué fotograma (absoluto) empieza y acaba. */
export type CtxEscena = { palabras: Palabra[]; base: number; ini: number; fin: number };

/** F(en) = fotograma ABSOLUTO en que se dice esa palabra (buscando desde el principio de la escena). */
export const Fde = (c: CtxEscena) => (en: number | string) => Math.round(c.palabras[indicePalabra(c.palabras, en, c.base)].ini * FPS);

const sonando = (c: CtxEscena, f: number) => c.palabras.some((p) => f / FPS >= p.ini && f / FPS <= p.fin);

/** Qué dibujo usar para una pose y una cara. Los dibujos que hay están en public/personaje (DIBUJOS). */
export function dibujoPara(pose: Pose, cara: Cara): string {
  const hay = (n: string) => (n in DIBUJOS ? n : "piensa");
  if (pose === "corre" || pose === "camina" || pose === "salta" || pose === "victoria") return hay("corre");
  if (pose === "cabeza" || pose === "asustado") return hay("cabeza");
  if (pose === "cruza") return hay("enfadado");
  if (pose === "agotado") return hay("agotado");
  if (pose === "piensa") return hay(cara === "piensa" ? "piensa" : "sentado");
  if (pose === "lee") return hay("lee");
  switch (cara) {
    case "sorpresa":
    case "asustado":
      return hay("cabeza");
    case "enfadado":
      return hay("enfadado");
    case "triste":
    case "aburrido":
    case "dormido":
      return hay("agotado");
    case "risa":
    case "feliz":
      return hay("corre");
    default:
      return hay("piensa");
  }
}

export function estadoActor(a: Actor, i: number, e: Escena, c: CtxEscena, f: number, variante: number): EstadoActor {
  void variante;
  const F = Fde(c);
  const fondo = a.fondo ?? 0.4;
  const y = SUELO + 40 + fondo * 120;
  const esc = 1.08 - fondo * 0.2;
  let x = LUGARES[e.lugar].x + (a.x ?? 0);
  let mira: 1 | -1 = a.mira ?? 1;
  let pose: Pose = a.pose ?? "bolsillos";
  let cara: Cara = a.cara ?? "normal";
  let habla = !!a.narra && sonando(c, f);
  let signo: EstadoActor["signo"] = null;
  let moviendo = false;
  let cambio = c.ini;
  let visible = true;
  if (a.entra) {
    const fe = F(a.entra.en);
    if (f < fe) visible = false;
    else if (a.entra.desde !== "pop") {
      const k = Math.min(1, (f - fe) / 24);
      x += (a.entra.desde === "izq" ? -1 : 1) * 700 * (1 - k);
      if (k < 1) {
        moviendo = true;
        mira = a.entra.desde === "izq" ? 1 : -1;
      }
    }
    cambio = Math.max(cambio, fe);
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
        if (f < fin) pose = ac.pose;
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
        const vel = ac.corre ? 18 : 9;
        const dur = Math.max(1, Math.abs(destino - x) / vel);
        const k = Math.min(1, (f - fa) / dur);
        if (k < 1) {
          moviendo = true;
          mira = destino >= x ? 1 : -1;
        }
        x = x + (destino - x) * k;
        break;
      }
    }
  }
  const dibujo = moviendo ? dibujoPara("corre", cara) : dibujoPara(pose, cara);
  // cuándo cambió de dibujo (para el «pop»): la última acción de cara/pose ya pasada
  for (const ac of acciones) {
    const fa = F(ac.en);
    if (fa <= f && (ac.hace === "cara" || ac.hace === "pose")) cambio = Math.max(cambio, fa);
  }
  return { x, y, esc, mira, dibujo, tDibujo: f - cambio, habla, moviendo, signo, visible };
}

/** Centro de la cabeza de un actor en el mundo (para planos «cerca» y para la nube). */
export const cabezaDe = (s: EstadoActor): [number, number] => [s.x, s.y - alturaCabeza(s.esc)];
