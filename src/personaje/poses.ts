// HECHO POR programa/recortar.py — no editar a mano. Medidas de cada dibujo del personaje (px de la imagen):
// caja = donde está el personaje; cara = [centro x, centro y, ancho de la cara]; pies = se ven los pies.
export const DIBUJOS: Record<string, { caja: [number, number, number, number]; tam: [number, number]; cara: [number, number, number]; pies: boolean }> = {
 "corre": {
  "caja": [
   80,
   50,
   664,
   700
  ],
  "tam": [
   684,
   756
  ],
  "cara": [
   426,
   216,
   214
  ],
  "pies": true
 },
 "lee": {
  "caja": [
   144,
   96,
   577,
   728
  ],
  "tam": [
   684,
   756
  ],
  "cara": [
   357,
   285,
   227
  ],
  "pies": true
 },
 "cabeza": {
  "caja": [
   131,
   76,
   592,
   755
  ],
  "tam": [
   680,
   756
  ],
  "cara": [
   345,
   276,
   255
  ],
  "pies": false
 },
 "enfadado": {
  "caja": [
   172,
   60,
   494,
   765
  ],
  "tam": [
   684,
   766
  ],
  "cara": [
   333,
   252,
   242
  ],
  "pies": false
 },
 "agotado": {
  "caja": [
   102,
   42,
   591,
   761
  ],
  "tam": [
   684,
   766
  ],
  "cara": [
   439,
   195,
   198
  ],
  "pies": true
 },
 "sentado": {
  "caja": [
   161,
   98,
   536,
   765
  ],
  "tam": [
   680,
   766
  ],
  "cara": [
   341,
   300,
   249
  ],
  "pies": false
 },
 "piensa": {
  "caja": [
   390,
   109,
   639,
   736
  ],
  "tam": [
   1024,
   764
  ],
  "cara": [
   502,
   216,
   138
  ],
  "pies": true
 }
};
