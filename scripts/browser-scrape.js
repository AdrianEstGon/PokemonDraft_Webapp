/* ============================================================================
 * counters.json desde el NAVEGADOR (vía fiable, sin Cloudflare de por medio)
 * ============================================================================
 *
 * uniteapi.dev está protegido por Cloudflare, así que scrapearlo desde un
 * servidor/CI falla. Pero TU navegador ya pasó el challenge cuando ves la página.
 * Este snippet lee la tabla de counters directamente del DOM y te descarga el
 * archivo `counters.json` listo para poner en `public/`.
 *
 * CÓMO USARLO
 * 1. Abre https://uniteapi.dev/en/counters e inicia la pestaña "General".
 *    (Opcional: pon el filtro en "All" para tener todos los Pokémon.)
 * 2. Baja hasta el final para que se carguen todas las filas.
 * 3. Abre la consola del navegador (F12 -> Console).
 * 4. Pega TODO este archivo y pulsa Enter.
 * 5. Se descargará `counters.json`. Cópialo a `PokemonDraft_Webapp/public/counters.json`,
 *    commitea y despliega. (Repite cuando quieras refrescar los datos.)
 *
 * Si descarga pocos Pokémon, mira lo que imprime en consola y avísame: ajusto
 * los selectores.
 * ========================================================================== */
(() => {
  const pctRe = /(\d{1,3}(?:\.\d)?)\s*%/;
  const nameFromImg = (img) =>
    (img && (img.getAttribute("alt") || img.getAttribute("title"))) || "";

  // 1) Localizar las filas de la tabla.
  let rows = Array.from(document.querySelectorAll("table tr"));
  if (rows.length < 5) {
    rows = Array.from(
      document.querySelectorAll("[class*='row'],[class*='Row']")
    ).filter((el) => el.querySelector("img"));
  }

  const matchups = {};
  let subjects = 0;

  for (const row of rows) {
    const imgs = Array.from(row.querySelectorAll("img")).filter((i) => nameFromImg(i));
    if (imgs.length < 2) continue;

    const subject = nameFromImg(imgs[0]).trim();
    if (!subject) continue;

    const opponents = [];
    for (let k = 1; k < imgs.length; k++) {
      const img = imgs[k];
      let node = img;
      let pct = null;
      for (let up = 0; up < 4 && node; up++) {
        const m = (node.textContent || "").match(pctRe);
        if (m) { pct = parseFloat(m[1]); break; }
        node = node.parentElement;
      }
      const opp = nameFromImg(img).trim();
      if (opp && pct != null) opponents.push({ opp, pct });
    }
    if (!opponents.length) continue;

    subjects++;
    matchups[subject] = matchups[subject] || {};
    for (const { opp, pct } of opponents) {
      if (opp === subject) continue;
      matchups[subject][opp] = Math.max(0, Math.min(100, Math.round(pct * 10) / 10));
    }
  }

  // 2) Relleno recíproco: si A gana a B al X%, B gana a A al (100-X)%.
  for (const a of Object.keys(matchups)) {
    for (const [b, v] of Object.entries(matchups[a])) {
      matchups[b] = matchups[b] || {};
      if (matchups[b][a] == null) {
        matchups[b][a] = Math.max(0, Math.min(100, Math.round((100 - v) * 10) / 10));
      }
    }
  }

  const data = {
    generatedAt: new Date().toISOString().slice(0, 10),
    updatedAt: new Date().toISOString(),
    source: "uniteapi.dev",
    note: "Scraped from https://uniteapi.dev/en/counters via browser console.",
    roles: {},
    matchups,
  };

  console.log(
    `%ccounters.json: ${subjects} Pokémon con datos, ` +
      `${Object.keys(matchups).length} en la matriz.`,
    "color:#31d07a;font-weight:bold"
  );
  if (subjects < 30) {
    console.warn(
      "Pocos Pokémon detectados. Asegúrate de haber bajado hasta el final y de estar en la pestaña General/All. " +
        "Si sigue fallando, copia este objeto y compártelo:",
      data
    );
  }

  // 3) Descargar el archivo.
  const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "counters.json";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
})();
