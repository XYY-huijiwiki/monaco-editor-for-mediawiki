(async () => {
  const manifestUrl = new URL(".vite/manifest.json", import.meta.url).href; // Holt den Pfad zur manifest.json
  const data = await (await fetch(manifestUrl)).json(); // Lädt den Inhalt der manifest.json
  const moduleUrl = new URL(data["index.html"]["file"], import.meta.url).href; // Bestimmt die URL der Einstiegspunkt-Datei
  import(moduleUrl); // Importiert das Modul dynamisch
})();
