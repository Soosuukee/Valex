import { fetchMaps } from "./fetch.js";
import { fetchAgents } from "./fetch.js";
import { isFavorite, toggleFavorite } from "./favorites.js";

const LANGUAGES = {
  "en-US": "🇬🇧",
  "fr-FR": "🇫🇷",
  "es-ES": "🇪🇸",
  "de-DE": "🇩🇪",
  "pt-BR": "🇧🇷",
  "ru-RU": "🇷🇺",
  "ja-JP": "🇯🇵",
  "ko-KR": "🇰🇷",
  "zh-CN": "🇨🇳",
  "zh-TW": "🇹🇼",
  "ar-AE": "🇦🇪",
  "es-MX": "🇲🇽",
  "id-ID": "🇮🇩",
  "it-IT": "🇮🇹",
  "pl-PL": "🇵🇱",
  "th-TH": "🇹🇭",
  "tr-TR": "🇹🇷",
  "vi-VN": "🇻🇳",
};

let selectedLanguage = localStorage.getItem("language") || "en-US";

const switcher = document.getElementById("lang-switcher");
if (switcher) {
  Object.entries(LANGUAGES).forEach(([code, flag]) => {
    const btn = document.createElement("button");
    btn.textContent = flag;
    btn.title = code;
    btn.className = "text-2xl hover:scale-110 transition-transform";
    btn.addEventListener("click", () => {
      selectedLanguage = code;
      localStorage.setItem("language", code);
      init();
    });
    switcher.appendChild(btn);
  });
}

const UNRANKED_MAPS = ["Abyss", "Bind", "Breeze", "Fracture"];
const PRACTICE_MAPS = "/Game/Maps/PovegliaV2/RangeV2";
const EXCLUDED_MAPS = ["/Game/Maps/Poveglia/Range", "/Game/Maps/NPEV2/NPEV2"];

const COMPOSITIONS_PER_MAP = {
  Ascent: ["Jett", "Sova", "Killjoy", "Omen", "KAY/O"],
  Bind: ["Raze", "Skye", "Gekko", "Brimstone", "Viper"],
  Breeze: ["Jett", "Sova", "Yoru", "Viper", "Astra"],
  Fracture: ["Neon", "Brimstone", "Breach", "Tejo", "Cypher"],
  Haven: ["Jett", "Tejo", "Cypher", "Omen", "Breach"],
  Icebox: ["Neon", "Sova", "Gekko", "Killjoy", "Viper"],
  Lotus: ["Raze", "Omen", "Fade", "Viper", "Vyse"],
  Pearl: ["Yoru", "Fade", "Vyse", "Astra", "Tejo"],
  Split: ["Yoru", "Tejo", "Breach", "Omen", "Viper"],
  Sunset: ["Raze", "Omen", "KAY/O", "Cypher", "Sova"],
  Abyss: ["Jett", "Omen", "Astra", "Sova", "KAY/O"],
};

const REAL_LOCATIONS = {
  Ascent: ["45°26′12″N, 12°20′26″E", "Venice, Italy"],
  Bind: ["33°30′0″N, 7°35′0″W", "Casablanca, Morocco"],
  Breeze: ["25°3′0″N, 77°21′0″W", "Bahamas"],
  Fracture: ["35°12′0″N, 106°39′0″W", "New Mexico, USA"],
  Haven: ["27°41′0″N, 85°19′0″E", "Bhaktapur, Nepal"],
  Icebox: ["73°0′0″N, 140°0′0″E", "Siberian Arctic"],
  Lotus: ["11°56′0″N, 75°53′0″E", "Western Ghats, India"],
  Pearl: ["38°43′0″N, 9°9′0″W", "Lisbon, Portugal"],
  Split: ["35°41′22″N, 139°41′30″E", "Tokyo, Japan"],
  Sunset: ["34°3′0″N, 118°15′0″W", "Los Angeles, USA"],
  Abyss: ["20°34′0″N, 142°11′0″E", "Mariana Trench"],
};

let allAgents = [];

function getMapType(map) {
  if (EXCLUDED_MAPS.includes(map.mapUrl)) return "excluded";
  if (PRACTICE_MAPS.includes(map.mapUrl)) return "range";
  if (map.tacticalDescription === null) return "tdm";
  return UNRANKED_MAPS.includes(map.displayName) ? "unranked" : "ranked";
}

async function setRandomMapBackground() {
  try {
    const response = await fetch("https://valorant-api.com/v1/maps");
    const data = await response.json();
    const playableMaps = data.data.filter(
      (map) => map.tacticalDescription !== null
    );
    if (playableMaps.length === 0) return;
    const randomMap =
      playableMaps[Math.floor(Math.random() * playableMaps.length)];
    document.body.style.backgroundImage = `url(${randomMap.stylizedBackgroundImage})`;
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center";
    document.body.style.backgroundRepeat = "no-repeat";
  } catch (error) {
    console.error("Erreur lors de la récupération du fond :", error);
  }
}

async function renderMaps(maps) {
  const container = document.getElementById("maps-container");
  container.innerHTML = "";

  const favContainer = document.createElement("section");
  favContainer.className = "mb-12";
  const favHeading = document.createElement("h2");
  favHeading.textContent = "⭐ Favorite Maps";
  favHeading.className = "text-3xl font-bold text-yellow-400 text-center mb-6";
  const favGrid = document.createElement("div");
  favGrid.className =
    "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-items-center";

  maps
    .filter((map) => isFavorite("maps", map.displayName))
    .forEach((map) => favGrid.appendChild(createMapCard(map)));

  if (favGrid.children.length > 0) {
    favContainer.appendChild(favHeading);
    favContainer.appendChild(favGrid);
    container.appendChild(favContainer);
  }

  const sections = {
    ranked: createSection("Ranked Map pool"),
    unranked: createSection("Unranked"),
    tdm: createSection("Team Deathmatch"),
    range: createSection("Practice"),
  };

  for (const map of maps) {
    const type = getMapType(map);
    if (type === "excluded") continue;
    const section = sections[type];
    section._grid.appendChild(createMapCard(map));
  }

  Object.values(sections).forEach((section) => container.appendChild(section));
}

function createMapCard(map) {
  const card = document.createElement("div");
  card.className =
    "relative bg-black/40 backdrop-blur-md rounded-2xl shadow-xl p-4 my-4 w-64 flex flex-col items-center text-center hover:scale-105 transition-transform duration-300";

  const name = document.createElement("h3");
  name.textContent = map.displayName;
  name.className = "text-xl font-semibold mb-4 text-white";

  const img = document.createElement("img");
  img.src = map.listViewIcon || map.displayIcon || "";
  img.alt = map.displayName;
  img.className = "w-full rounded-md shadow-lg";

  const favBtn = document.createElement("button");
  favBtn.textContent = isFavorite("maps", map.displayName) ? "★" : "☆";
  favBtn.className = "absolute top-2 right-2 text-yellow-400 text-xl z-10";
  favBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleFavorite("maps", map.displayName);
    favBtn.textContent = isFavorite("maps", map.displayName) ? "★" : "☆";
    renderMaps(JSON.parse(localStorage.getItem("valex_maps_cache")));
  });

  card.append(name, img, favBtn);
  card.addEventListener("click", async () => {
    await openModal(map);
  });

  return card;
}

async function openModal(map) {
  const modal = document.getElementById("map-modal");
  const content = document.getElementById("modal-content");
  const wrapper = document.getElementById("modal-content-wrapper");

  content.innerHTML = "";

  const mapname = document.createElement("h4");
  mapname.textContent = map.displayName;
  mapname.className = "text-xl font-bold mb-4";

  const mapimg = document.createElement("img");
  mapimg.src = map.splash;
  mapimg.alt = map.displayName;
  mapimg.className = "mx-auto w-full rounded mb-4";

  content.append(mapname, mapimg);

  if (REAL_LOCATIONS[map.displayName]) {
    const [coords, city] = REAL_LOCATIONS[map.displayName];
    const coordText = document.createElement("p");
    coordText.textContent = coords;
    coordText.className = "text-sm text-black text-center font-mono";

    const cityText = document.createElement("p");
    cityText.textContent = city;
    cityText.className = "italic font-bold text-center text-gray-700 mb-4";

    content.append(coordText, cityText);
  }

  const seeMore = document.createElement("button");
  seeMore.textContent = "See callouts";
  seeMore.className = "bg-blue-600 text-white px-4 py-2 rounded mb-4";
  seeMore.addEventListener("click", () => {
    window.open(`map_view.html?uuid=${map.uuid}`, "_blank");
  });
  content.appendChild(seeMore);

  if (map.tacticalDescription && COMPOSITIONS_PER_MAP[map.displayName]) {
    const compTitle = document.createElement("h5");
    compTitle.textContent = "Recommended composition:";
    compTitle.className = "font-semibold text-black mt-4 mb-2 text-center";
    content.appendChild(compTitle);

    const agentContainer = document.createElement("div");
    agentContainer.className = "flex justify-center gap-3 flex-wrap";

    const agents = COMPOSITIONS_PER_MAP[map.displayName];
    agents.forEach((name) => {
      const agent = allAgents.find((a) => a.displayName === name);
      if (!agent || !agent.displayIcon) return;

      const icon = document.createElement("img");
      icon.src = agent.displayIcon;
      icon.alt = agent.displayName;
      icon.title = agent.displayName;
      icon.className = "w-12 h-12 object-contain rounded-full border";
      agentContainer.appendChild(icon);
    });

    content.appendChild(agentContainer);
  }

  modal.classList.remove("hidden");
  wrapper.classList.remove("scale-95", "opacity-0");
  wrapper.classList.add("scale-100", "opacity-100");

  document.getElementById("close-modal").addEventListener("click", () => {
    wrapper.classList.remove("scale-100", "opacity-100");
    wrapper.classList.add("scale-95", "opacity-0");
    setTimeout(() => {
      modal.classList.add("hidden");
    }, 200);
  });

  document.getElementById("map-modal").addEventListener("click", (e) => {
    if (e.target.id === "map-modal") {
      document.getElementById("close-modal").click();
    }
  });
}

function createSection(title) {
  const wrapper = document.createElement("div");
  wrapper.className = "mb-16";

  const heading = document.createElement("h2");
  heading.textContent = title;
  heading.className = "text-4xl font-extrabold mb-6 text-center";

  const grid = document.createElement("div");
  grid.className =
    "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-items-center";

  wrapper.appendChild(heading);
  wrapper.appendChild(grid);
  wrapper._grid = grid;
  return wrapper;
}

async function init() {
  await setRandomMapBackground();
  const [mapRes, agentRes] = await Promise.all([
    fetchMaps(selectedLanguage),
    fetchAgents(selectedLanguage),
  ]);
  localStorage.setItem("valex_maps_cache", JSON.stringify(mapRes.data));
  allAgents = agentRes.data.filter((a) => a.isPlayableCharacter);
  await renderMaps(mapRes.data);
}

window.addEventListener("load", init);
