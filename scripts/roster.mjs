// Pokémon Unite roster (name -> role), used only for the *fallback seed* and for
// helping the scraper normalise names. The live source of truth is uniteapi.dev,
// scraped daily into public/counters.json. Roles here are best-effort; the scraper
// overrides all matchup values. Names are joined to the backend roster by a
// normalised key (lowercase, alphanumerics only), so minor spelling differences
// are harmless.

export const ROLES = ["Attacker", "All-Rounder", "Defender", "Speedster", "Supporter"];

export const ROSTER = [
  // Attackers
  ["Pikachu", "Attacker"], ["Cinderace", "Attacker"], ["Greninja", "Attacker"],
  ["Cramorant", "Attacker"], ["Venusaur", "Attacker"], ["Alolan Ninetales", "Attacker"],
  ["Sylveon", "Attacker"], ["Gardevoir", "Attacker"], ["Espeon", "Attacker"],
  ["Glaceon", "Attacker"], ["Decidueye", "Attacker"], ["Dragapult", "Attacker"],
  ["Duraludon", "Attacker"], ["Delphox", "Attacker"], ["Chandelure", "Attacker"],
  ["Inteleon", "Attacker"], ["Miraidon", "Attacker"], ["Mew", "Attacker"],
  ["Armarouge", "Attacker"], ["Alolan Raichu", "Attacker"], ["Latios", "Attacker"],
  ["Empoleon", "Attacker"], ["Mewtwo Y", "Attacker"], ["Yveltal", "Attacker"],
  ["Moltres", "Attacker"], ["Articuno", "Attacker"],

  // All-Rounders
  ["Charizard", "All-Rounder"], ["Lucario", "All-Rounder"], ["Garchomp", "All-Rounder"],
  ["Machamp", "All-Rounder"], ["Tsareena", "All-Rounder"], ["Aegislash", "All-Rounder"],
  ["Blaziken", "All-Rounder"], ["Dragonite", "All-Rounder"], ["Tyranitar", "All-Rounder"],
  ["Metagross", "All-Rounder"], ["Scizor", "All-Rounder"], ["Azumarill", "All-Rounder"],
  ["Urshifu", "All-Rounder"], ["Zoroark", "All-Rounder"], ["Ceruledge", "All-Rounder"],
  ["Gyarados", "All-Rounder"], ["Falinks", "All-Rounder"], ["Buzzwole", "All-Rounder"],
  ["Feraligatr", "All-Rounder"], ["Quaquaval", "All-Rounder"], ["Mewtwo X", "All-Rounder"],
  ["Skeledirge", "All-Rounder"], ["Pawmot", "All-Rounder"], ["Mimikyu", "All-Rounder"],
  ["Zacian", "All-Rounder"],

  // Defenders
  ["Snorlax", "Defender"], ["Slowbro", "Defender"], ["Crustle", "Defender"],
  ["Blastoise", "Defender"], ["Lapras", "Defender"], ["Goodra", "Defender"],
  ["Trevenant", "Defender"], ["Greedent", "Defender"], ["Umbreon", "Defender"],
  ["Ho-Oh", "Defender"], ["Suicune", "Defender"], ["Mamoswine", "Defender"],
  ["Dhelmise", "Defender"],

  // Speedsters
  ["Zeraora", "Speedster"], ["Talonflame", "Speedster"], ["Absol", "Speedster"],
  ["Gengar", "Speedster"], ["Dodrio", "Speedster"], ["Leafeon", "Speedster"],
  ["Darkrai", "Speedster"], ["Meowth", "Speedster"], ["Meowscarada", "Speedster"],
  ["Galarian Rapidash", "Speedster"],

  // Supporters
  ["Blissey", "Supporter"], ["Wigglytuff", "Supporter"], ["Eldegoss", "Supporter"],
  ["Hoopa", "Supporter"], ["Comfey", "Supporter"], ["Clefable", "Supporter"],
  ["Sableye", "Supporter"], ["Latias", "Supporter"], ["Psyduck", "Supporter"],
  ["Alcremie", "Supporter"], ["Tinkaton", "Supporter"], ["Meganium", "Supporter"],
];

export const normalizeName = (name) =>
  String(name || "").toLowerCase().replace(/[^a-z0-9]/g, "");
