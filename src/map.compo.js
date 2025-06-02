
import { fetchMaps } from './fetch.js';
import { fetchAgents } from './fetch.js';

const UNRANKED_MAPS = ["Abyss","Bind","Breeze","Fracture"];
const PRACTICE_MAPS = "/Game/Maps/PovegliaV2/RangeV2";
const EXCLUDED_MAPS=["/Game/Maps/Poveglia/Range","/Game/Maps/NPEV2/NPEV2"];

const COMPOSITIONS_PER_MAP = {
  Ascent:   ["Jett", "Sova", "Killjoy", "Omen", "KAY/O"],
  Bind:     ["Raze", "Skye", "Gekko", "Brimstone", "Viper"],
  Breeze:   ["Jett", "Sova", "Yoru", "Viper", "Astra"],
  Fracture: ["Neon", "Brimstone", "Breach", "Tejo", "Cypher"],
  Haven:    ["Jett", "Tejo", "Cypher", "Omen", "Breach"],
  Icebox:   ["Neon", "Sova", "Gekko", "Killjoy", "Viper"],
  Lotus:    ["Raze", "Omen", "Fade", "Viper", "Vyse"],
  Pearl:    ["Yoru", "Fade", "Vyse", "Astra", "Tejo"],
  Split:    ["Yoru", "Tejo", "Breach", "Omen", "Viper"],
  Sunset:   ["Raze", "Omen", "KAY/O", "Cypher", "Sova"],
  Abyss:    ["Jett", "Omen", "Astra", "Sova", "KAY/O"]
};

function getMapType(map) {
  if (EXCLUDED_MAPS.includes(map.mapUrl)) return "excluded";
  if (PRACTICE_MAPS.includes(map.mapUrl)) return "range";
  if (map.tacticalDescription === null) return "tdm";
  return UNRANKED_MAPS.includes(map.displayName) ? "unranked" : "ranked";
}

async function setRandomMapBackground() {
  try {
    const response = await fetch('https://valorant-api.com/v1/maps');
    const data = await response.json();
    const playableMaps = data.data.filter(map => map.tacticalDescription !== null);
    if (playableMaps.length === 0) return;

    const randomMap = playableMaps[Math.floor(Math.random() * playableMaps.length)];
    document.body.style.backgroundImage = `url(${randomMap.stylizedBackgroundImage})`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
    document.body.style.backgroundRepeat = 'no-repeat';
  } catch (error) {
    console.error('Erreur lors de la récupération des cartes :', error);
  }
}

function renderMaps(maps) {
  const container = document.getElementById("maps-container");

  const sections = {
    ranked: createSection("Ranked"),
    unranked: createSection("Unranked"),
    tdm: createSection("TDM"),
    range: createSection("Practice")
  };

  maps.forEach(map => {
    const type = getMapType(map);
    if (type === "excluded") return;

    const section = sections[type];
    const card = document.createElement("div");
    card.className = "bg-black/40 backdrop-blur-md rounded-2xl shadow-xl p-4 my-4 w-64 flex flex-col items-center text-center hover:scale-105 transition-transform duration-300";

    const name = document.createElement("h3");
    name.textContent = map.displayName;
    name.className = "text-xl font-semibold mb-4 text-white";

    const img = document.createElement("img");
    img.src = map.listViewIcon || map.displayIcon || "";
    img.alt = map.displayName;
    img.className = "w-full rounded-md shadow-lg";

    card.append(name, img);
    card.addEventListener("click", () => openModal(map));
    section._grid.appendChild(card);
  });

  Object.values(sections).forEach(section => container.appendChild(section));
}

function openModal(map) {
  const modal = document.getElementById("map-modal");
  const content = document.getElementById("modal-content");
  const wrapper = document.getElementById("modal-content-wrapper");

  content.innerHTML = "";

  const mapname = document.createElement("h4");
  mapname.textContent = map.displayName;
  mapname.className = "text-xl font-bold mb-2";

  const mapimg = document.createElement("img");
  mapimg.src = map.splash;
  mapimg.alt = map.displayName;
  mapimg.className = "mx-auto w-48 mb-4";

  const voirPlus = document.createElement("button");
  voirPlus.textContent = "Voir +";
  voirPlus.className = "bg-blue-600 text-white px-4 py-2 rounded";
  voirPlus.addEventListener("click", () => {
    window.open(`map_view.html?uuid=${map.uuid}`, "_blank");
  });

  content.append(mapname, mapimg, voirPlus);
  modal.classList.remove("hidden");
  wrapper.classList.remove("scale-95", "opacity-0");
  wrapper.classList.add("scale-100", "opacity-100");
}

function createSection(title) {
  const wrapper = document.createElement("div");
  wrapper.className = "mb-16";

  const heading = document.createElement("h2");
  heading.textContent = title;
  heading.className = "text-4xl font-extrabold mb-6 text-center";

  const grid = document.createElement("div");
  grid.className = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-items-center";

  wrapper.appendChild(heading);
  wrapper.appendChild(grid);
  wrapper._grid = grid;
  return wrapper;
}

async function init() {
  await setRandomMapBackground();
  const response = await fetchMaps();
  const maps = response.data;
  renderMaps(maps);
}

window.addEventListener('load', init);
