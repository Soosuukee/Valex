import { fetchMaps } from './fetch.js';
import { fetchAgents } from './fetch.js';

async function init() {
  const response = await fetchMaps();
  const maps = response.data;
  renderMaps(maps);
}
const UNRANKED_MAPS = ["Abyss","Bind","Breeze","Fracture"];
const PRACTICE_MAPS = ["The Range","Basic Training"]; 

const COMPOSITIONS_PER_MAP = {
  "Abyss":["Sova", "Killjoy", "Omen", "Jett", "KAY/O"],
  "Ascent": ["Sova", "Killjoy", "Omen", "Jett", "KAY/O"],
  "Bind": ["Viper", "Raze", "Skye", "Brimstone", "Chamber"],
  "Breeze": ["Viper", "Raze", "Skye", "Brimstone", "Chamber"],
  "Fracture": ["Viper", "Raze", "Skye", "Brimstone", "Chamber"],
  "Haven": ["Viper", "Raze", "Skye", "Brimstone", "Chamber"],
  "Icebox": ["Viper", "Raze", "Skye", "Brimstone", "Chamber"],
  "Lotus": ["Viper", "Raze", "Skye", "Brimstone", "Chamber"],
  "Pearl": ["Viper", "Raze", "Skye", "Brimstone", "Chamber"],
  "Split": ["Viper", "Raze", "Skye", "Brimstone", "Chamber"],
  "Sunset": ["Viper", "Raze", "Skye", "Brimstone", "Chamber"],
};


function getMapType(map){
     if (PRACTICE_MAPS.includes(map.displayName)) {
    return "range";
    }
     else if (map.tacticalDescription === null) {
        return "tdm";
    }else {
        if ( UNRANKED_MAPS.includes(map.displayName)){
            return "unranked";
        }else{
            return "ranked";
        }
    }
}


function renderMaps(maps) {
  const container = document.getElementById("maps-container");

  maps.forEach(map => {
    if (NOT_IN_COMPETITIVE_MAPS.includes(map.displayName)||map.tacticalDescription==null ) {
      const card = document.createElement("div");
      card.className = "rounded-xl shadow-lg p-4 flex flex-col items-center text-center cursor-pointer hover:scale-105 transition-transform duration-200";

      const gradient = `linear-gradient(to bottom right, ${agent.backgroundGradientColors.map(c => `#${c}`).join(', ')})`;
      card.style.background = gradient;

      const name = document.createElement("h3");
      name.textContent = agent.displayName;

      const img = document.createElement("img");
      img.src = agent.displayIcon;
      img.alt = agent.displayName;
      img.style.width = "150px";

      card.append(name, img);
      card.addEventListener("click", () => openModal(agent));

      container.appendChild(card);
    }
  });
}