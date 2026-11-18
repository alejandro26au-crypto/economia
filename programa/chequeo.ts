// Chequeo de planos fuera del navegador: node programa/chequeo.js salida/props-N.json (lo compila «canal revisar»).
import { readFileSync } from "fs";
import { chequearPlanos } from "../src/motor/Chequeo";

const props = JSON.parse(readFileSync(process.argv[2], "utf-8"));
const avisos = chequearPlanos(props);
if (!avisos.length) console.log("✓ Chequeo de planos: ninguno con problemas.");
else {
  console.log(`⚠ Chequeo de planos: ${avisos.length} con problemas`);
  for (const a of avisos) console.log("  - " + a);
}
