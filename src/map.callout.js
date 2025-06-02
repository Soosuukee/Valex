
import { fetchMaps } from './fetch.js';

const UNRANKED_MAPS = ["Abyss","Bind","Breeze","Fracture"];
const PRACTICE_MAPS = "/Game/Maps/PovegliaV2/RangeV2";
const EXCLUDED_MAPS=["/Game/Maps/Poveglia/Range","/Game/Maps/NPEV2/NPEV2"];

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

  const splash = document.createElement("img");
  splash.src = map.splash;
  splash.className = "mx-auto w-48 mb-4";

  const btn = document.createElement("button");
  btn.textContent = "Voir +";
  btn.className = "bg-blue-600 text-white px-4 py-2 rounded mb-4";
  btn.addEventListener("click", () => showCallouts(map, content));

  content.append(mapname, splash, btn);
  modal.classList.remove("hidden");
  wrapper.classList.remove("scale-95", "opacity-0");
  wrapper.classList.add("scale-100", "opacity-100");
}

function showCallouts(map, container) {
  const wrapper = document.createElement("div");
  wrapper.className = "relative w-full mt-4";

  const mapImg = document.createElement("img");
  mapImg.src = map.displayIcon;
  mapImg.id = "mapImage";
  mapImg.className = "w-full h-auto rounded";

  const calloutWrapper = document.createElement("div");
  calloutWrapper.className = "absolute top-0 left-0 w-full h-full pointer-events-none";
  calloutWrapper.id = "calloutWrapper";

  wrapper.append(mapImg, calloutWrapper);
  container.append(wrapper);

  mapImg.onload = () => {
    const width = mapImg.naturalWidth;
    const height = mapImg.naturalHeight;

    map.callouts?.forEach(({ regionName, location }) => {
      const { x, y } = location;

      const absX = (x * 0.01087) + (y * 0.15203) + 1656.93;
      const absY = (x * -0.14403) + (y * 0.00653) + 1200.73;

      const percentX = (absX / width) * 100;
      const percentY = (absY / height) * 100;

      const div = document.createElement("div");
      div.className = "absolute bg-red-600 text-white text-xs font-bold px-1 py-[1px] rounded transform -translate-x-1/2 -translate-y-1/2";
      div.style.left = `${percentX}%`;
      div.style.top = `${percentY}%`;
      div.textContent = regionName;
      calloutWrapper.appendChild(div);
    });
  };
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
