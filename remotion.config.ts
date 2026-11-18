import { Config } from "@remotion/cli/config";
import { existsSync } from "fs";

Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(92);
Config.setDelayRenderTimeoutInMilliseconds(120000);

// En la nube de Claude (Linux) no se puede descargar el navegador de Remotion: usa el Chromium de la máquina.
const CHROME_NUBE = "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell";
if (existsSync(CHROME_NUBE)) Config.setBrowserExecutable(CHROME_NUBE);

// Los escenarios son 3D (WebGL): en Mac/Windows usa la tarjeta gráfica; en la nube, el dibujo por software.
Config.setChromiumOpenGlRenderer(existsSync(CHROME_NUBE) ? "swangle" : "angle");
