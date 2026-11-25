import React from "react";
import { Composition } from "remotion";
import { Ficha, FichaCerca } from "./bent/Ficha";
import { HojaReparto } from "./reparto/Hoja";
import { Short } from "./motor/Short";
import { Chequeo } from "./motor/Chequeo";
import { ALTO, ANCHO, FPS } from "./motor/tiempo";
import { PropsShort } from "./motor/tipos";
import { PruebaRecortes } from "./pruebas/Recortes";
import { MunecoDemo } from "./pruebas/MunecoDemo";
import { ToonDemo } from "./pruebas/ToonDemo";
import { RepartoEspecie } from "./pruebas/RepartoEspecie";
import { EstiloBoceto, EstiloIsometrico, HojaProtagonista } from "./pruebas/Boceto";
import { EstiloIlustrado, EstiloMezcla, EstiloPlano } from "./pruebas/Estilos";

// Guion de la idea 0 (Textos/0 - …txt) para ver algo en el estudio sin voz.
const GUION_0 =
  "Bacon is frying at the bottom of the sea. During World War Two, a navy crew heard it. Their sonar was the best in the fleet. And out there, enemy submarines were hunting them. But all the sonar guy heard was sizzling. The crew laughed and called him Bacon Ears. The captain was sure it was a secret enemy weapon, jamming their sonar. Then something weird happened. The sizzling got louder near every reef. Then it got weirder. It came from the whole sea floor at once. Then the weirdest part. It got so loud, it could hide an enemy submarine. So the navy called in scientists. And the secret weapon was a shrimp. Smaller than your finger. It snaps its giant claw so fast, the water rips open into a bubble. When that bubble collapses, it gets nearly as hot as the surface of the Sun. It even flashes light. Millions of them, snapping at once. Bacon Ears was right all along. And right now, on warm reefs all over the world,";

// Valores de ejemplo para el estudio (usa la idea 0, la de prueba); el programa pasa los de verdad.
const EJEMPLO: PropsShort = {
  n: 8,
  variante: 1,
  duracion: 62,
  palabras: GUION_0.split(" ").map((p, i) => ({ p, ini: 0.2 + i * 0.355, fin: 0.5 + i * 0.355 })),
  voz: null,
  musica: null,
};

export const Root: React.FC = () => (
  <>
  <Composition id="reparto" component={HojaReparto} width={2560} height={1900} fps={FPS} durationInFrames={30} />
  <Composition id="ficha-cerca" component={FichaCerca} width={2000} height={1000} fps={FPS} durationInFrames={30} />
  <Composition id="ficha-bent" component={Ficha} width={2560} height={2100} fps={FPS} durationInFrames={30} />
  <Composition id="chequeo" component={Chequeo} width={ANCHO} height={ALTO} fps={FPS} durationInFrames={1} defaultProps={EJEMPLO} />
  <Composition id="estilo-plano" component={EstiloPlano} width={1920} height={1080} fps={FPS} durationInFrames={90} />
  <Composition id="estilo-ilustrado" component={EstiloIlustrado} width={1920} height={1080} fps={FPS} durationInFrames={90} />
  <Composition id="estilo-boceto" component={EstiloBoceto} width={1920} height={1080} fps={FPS} durationInFrames={90} />
  <Composition id="protagonista" component={HojaProtagonista} width={1920} height={1080} fps={FPS} durationInFrames={90} />
  <Composition id="estilo-isometrico" component={EstiloIsometrico} width={1920} height={1080} fps={FPS} durationInFrames={90} />
  <Composition id="toon-demo" component={ToonDemo} width={1920} height={1080} fps={FPS} durationInFrames={120} />
  <Composition id="reparto-especie" component={RepartoEspecie} width={1920} height={1080} fps={FPS} durationInFrames={60} />
  <Composition id="muneco-demo" component={MunecoDemo} width={1920} height={1080} fps={FPS} durationInFrames={420} />
  <Composition id="muneco-lapiz" component={MunecoDemo} defaultProps={{ lapiz: true }} width={1920} height={1080} fps={FPS} durationInFrames={420} />
  <Composition id="prueba-recortes" component={PruebaRecortes} width={1920} height={1080} fps={FPS} durationInFrames={300} />
  <Composition id="estilo-mezcla" component={EstiloMezcla} width={1920} height={1080} fps={FPS} durationInFrames={90} />
  <Composition
    id="short"
    component={Short}
    width={ANCHO}
    height={ALTO}
    fps={FPS}
    durationInFrames={FPS * 10}
    defaultProps={EJEMPLO}
    calculateMetadata={({ props }) => ({ durationInFrames: Math.ceil((props.duracion + 0.7) * FPS) })}
  />
  </>
);
