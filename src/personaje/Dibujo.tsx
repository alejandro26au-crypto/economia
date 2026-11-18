// EL PERSONAJE = TUS DIBUJOS (referencias/personaje.png y referencias/expresiones.png), recortados tal cual con
// programa/recortar.py en public/personaje/. Así es idéntico a la referencia. Se anima como «imagen animada»:
// respira, bota y se ladea al hablar, hace «pop» al cambiar de dibujo y la línea hierve un poco (dibujo a mano).
// Para más poses o expresiones: dibujos nuevos con el mismo estilo → `python3 programa/recortar.py img nombre`.
import React from "react";
import { staticFile } from "remotion";
import { DIBUJOS } from "./poses";

/** Ancho de la CARA en px del mundo (todos los dibujos se igualan por la cara). */
export const CARA_MUNDO = 86;
/** De pie (dibujo «piensa»): del centro de la cara a los pies, en caras. */
const CARA_A_PIES = (736 - 216) / 138;

/** ¿Este dibujo está cortado (sin piernas)? La cámara lo encuadra de cintura para arriba. */
export const cortado = (dibujo: string) => !(DIBUJOS[dibujo] ?? DIBUJOS.piensa).pies;

export type Dibujo = keyof typeof DIBUJOS | string;

/** Dibujo del personaje con los pies en (0,0). t = fotogramas desde que cambió de dibujo; habla = boca/voz. */
export const PersonajeDibujado: React.FC<{ dibujo: Dibujo; f: number; t: number; habla: boolean; mira: 1 | -1; esc?: number; moviendo?: boolean; id: string }> = ({ dibujo, f, t, habla, mira, esc = 1, moviendo, id }) => {
  const d = DIBUJOS[dibujo] ?? DIBUJOS.piensa;
  const k = (CARA_MUNDO / d.cara[2]) * esc;
  // anclaje: si se ven los pies, el borde de abajo del dibujo va al suelo; si no, la cara a la altura de alguien de pie
  const ax = d.cara[0];
  const ay = d.pies ? d.caja[3] - 4 : d.cara[1] + CARA_A_PIES * d.cara[2];
  // animación
  const pop = t < 10 ? 1 + Math.sin((t / 10) * Math.PI) * 0.07 : 1;
  const respira = 1 + Math.sin(f * 0.11) * 0.012;
  const bota = habla ? Math.abs(Math.sin(f * 0.42)) * 5 : 0;
  const ladea = habla ? Math.sin(f * 0.17) * 1.6 : Math.sin(f * 0.05) * 0.5;
  const salto = moviendo ? Math.abs(Math.sin(f * 0.5)) * 18 : 0;
  const hierve = Math.floor(f / 4) % 4;
  return (
    <g transform={`translate(0 ${-bota - salto}) rotate(${ladea}) scale(${mira * k * pop} ${k * pop * respira})`}>
      <defs>
        <filter id={`hv${id}`} x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves={1} seed={hierve} />
          <feDisplacementMap in="SourceGraphic" scale={2.5} />
        </filter>
      </defs>
      {!d.pies && (
        <linearGradient id={`fd${id}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0.8" stopColor="#fff" />
          <stop offset="1" stopColor="#000" />
        </linearGradient>
      )}
      {!d.pies && (
        <mask id={`mk${id}`} maskUnits="userSpaceOnUse" x={-ax} y={-ay} width={d.tam[0]} height={d.tam[1]}>
          <rect x={-ax} y={-ay} width={d.tam[0]} height={d.tam[1]} fill={`url(#fd${id})`} />
        </mask>
      )}
      <image mask={d.pies ? undefined : `url(#mk${id})`} href={staticFile(`personaje/${dibujo in DIBUJOS ? dibujo : "piensa"}.png`)} x={-ax} y={-ay} width={d.tam[0]} height={d.tam[1]} filter={`url(#hv${id})`} />
    </g>
  );
};

/** Centro de la cabeza respecto a los pies (px del mundo), para la cámara y la nube. */
export const alturaCabeza = (esc = 1) => CARA_A_PIES * CARA_MUNDO * esc;
