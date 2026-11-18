// Estado de un actor en un fotograma (dónde está, qué cara pone, si habla…), sin dibujar nada.
// Lo usan la cámara (para saber a quién mirar) y el dibujo de los personajes.
import { Easing } from "remotion";
import { DatosEscenario } from "./escenarios-datos";
import { TAM_BASE } from "./personajes";
import { mezcla, tramo } from "./tiempo";
import { Actor, Cara, En, Pose } from "./tipos";

export type EstadoActor = {
  visible: boolean;
  x: number;
  z: number;
  alto: number; // metros sobre el suelo
  anchoM: number; // ancho en metros (ya con crece/encoge/escala)
  cara: Cara;
  mira: 1 | -1;
  giro: number;
  habla: boolean;
  brillo: number;
  opacidad: number;
  pop: number; // escala de entrada
  pose: Pose;
  poseAnt: Pose;
  tPose: number; // fotogramas desde el último cambio de postura
  chasca: number; // fotogramas desde el último chasquido (-1 = nunca)
};

/** F(palabra) → fotograma de la escena en que se dice. */
export function estadoActor(actor: Actor, f: number, F: (en: En | undefined, def?: number) => number, sonando: (f: number) => boolean): EstadoActor {
  const fe = F(actor.entra?.en, 0);
  const te = actor.entra ? tramo(f, fe, fe + 12, Easing.out(Easing.back(1.5))) : 1;
  let x = actor.x;
  let z = actor.z ?? 0.4;
  let alto = actor.alto ?? 0;
  let pop = 1;
  let opacidad = 1;
  switch (actor.entra?.desde) {
    case "izq":
      x -= (1 - te) * 1.3;
      break;
    case "der":
      x += (1 - te) * 1.3;
      break;
    case "abajo":
      alto -= (1 - te) * 1.5;
      opacidad = Math.min(1, te * 1.5);
      break;
    case "arriba":
      alto += (1 - te) * 3;
      break;
    case "pop":
      pop = Math.max(0, te);
      break;
  }
  let cara: Cara = actor.cara ?? "normal";
  let mira = actor.mira ?? 1;
  let giro = 0;
  let habla = false;
  let brillo = 0;
  let tam = 1;
  let pose: Pose = actor.pose ?? "bolsillos";
  let poseAnt: Pose = pose;
  let tPose = 999;
  const ponPose = (nueva: Pose, desde: number) => {
    if (nueva === pose) return;
    poseAnt = pose;
    pose = nueva;
    tPose = desde;
  };
  let chasca = -1;
  const base = actor.tam ?? TAM_BASE[actor.tipo];
  for (const a of actor.acciones ?? []) {
    const fa = F(a.en);
    if (f < fa) continue;
    const t = f - fa;
    switch (a.hace) {
      case "cara":
        cara = a.cara;
        break;
      case "mira":
        mira = a.lado;
        break;
      case "mueve": {
        const k = tramo(t, 0, a.dura ?? 20);
        x = mezcla(x, a.a.x ?? x, k);
        z = mezcla(z, a.a.z ?? z, k);
        alto = mezcla(alto, a.a.alto ?? alto, k);
        break;
      }
      case "salta":
        alto += Math.sin(Math.min(1, t / 14) * Math.PI) * base * 0.6;
        break;
      case "gira":
        giro += 360 * tramo(t, 0, 16);
        break;
      case "tiembla":
        if (t < 24) x += (Math.sin(t * 2.2) * 0.012 * (1 - t / 24) * base) / 0.3;
        break;
      case "late":
        tam *= 1 + Math.max(0, Math.sin(t * 0.35)) ** 3 * 0.14;
        break;
      case "brilla":
        brillo = tramo(t, 0, 10);
        break;
      case "habla": {
        const fin = a.hasta !== undefined ? F(a.hasta) : fa + 45;
        if (f < fin && sonando(f)) habla = true;
        break;
      }
      case "pose": {
        const fin = a.hasta !== undefined ? F(a.hasta) : Infinity;
        if (f < fin) ponPose(a.pose, t);
        else ponPose(actor.pose ?? "bolsillos", f - fin);
        break;
      }
      case "rie":
        if (t < 50) cara = "risa";
        break;
      case "senala":
        if (t < 45) ponPose("senala", t);
        else if (pose === "senala") ponPose(actor.pose ?? "bolsillos", t - 45);
        break;
      case "chasca":
        chasca = t;
        break;
      case "escala":
        tam *= mezcla(1, a.a, tramo(t, 0, a.dura ?? 20));
        break;
      case "encoge":
        tam *= mezcla(1, 0.3, tramo(t, 0, 22));
        break;
      case "crece":
        tam *= mezcla(1, 1 / 0.3, tramo(t, 0, 22));
        break;
      case "desaparece":
        opacidad *= 1 - tramo(t, 0, 10);
        break;
    }
  }
  if (actor.extra?.narra === true && sonando(f)) habla = true;
  return { visible: f >= fe, x, z, alto, anchoM: base * tam, cara, mira, giro, habla, brillo, opacidad, pop, pose, poseAnt, tPose, chasca };
}

/** Posición en el mundo (metros) de la base del actor. */
export function mundo(esc: DatosEscenario, e: { x: number; z: number; alto: number }): [number, number, number] {
  return [esc.centro[0] + (e.x - 0.5) * esc.ancho, esc.suelo + e.alto, esc.centro[2] - e.z * esc.fondo];
}

/** Fotogramas en que cada actor hace algo (para que la cámara le mire justo entonces). */
export function momentosActores(actores: Actor[], F: (en: En | undefined, def?: number) => number) {
  const out: { f: number; actor: number }[] = [];
  actores.forEach((a, i) => {
    if (a.entra?.en !== undefined) out.push({ f: F(a.entra.en), actor: i });
    for (const ac of a.acciones ?? []) if (ac.hace !== "mira") out.push({ f: F(ac.en), actor: i });
  });
  return out.sort((p, q) => p.f - q.f);
}
