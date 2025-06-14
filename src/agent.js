import { fetchAgents } from "./fetch.js";
import { isFavorite, toggleFavorite, getFavorites } from "./favorites.js";

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

let allAgents = [];

async function init() {
  showLoader(true);
  const response = await fetchAgents(selectedLanguage);
  allAgents = response.data.filter((a) => a.isPlayableCharacter);
  populateRoleFilter(allAgents);
  renderFavoriteAgents(allAgents);
  renderAgents(allAgents);
  showLoader(false);
}

function showLoader(state) {
  const loader = document.getElementById("loader");
  loader.classList.toggle("hidden", !state);
}

function populateRoleFilter(agents) {
  const select = document.getElementById("role-filter");
  const roles = [
    ...new Set(agents.map((a) => a.role?.displayName).filter(Boolean)),
  ];
  roles.sort();

  roles.forEach((role) => {
    const option = document.createElement("option");
    option.value = role;
    option.textContent = role;
    select.appendChild(option);
  });

  select.addEventListener("change", () => {
    renderFavoriteAgents(allAgents);
    renderAgents(allAgents);
  });
}

function renderFavoriteAgents(agents) {
  const favSection = document.getElementById("favorites-section");
  const favContainer = document.getElementById("favorites-container");
  favContainer.innerHTML = "";

  const favorites = agents.filter((a) => isFavorite("agents", a.displayName));

  if (favorites.length === 0) {
    favSection.classList.add("hidden");
    return;
  }

  favSection.classList.remove("hidden");

  favorites.forEach((agent) => {
    const card = createAgentCard(agent);
    favContainer.appendChild(card);
  });
}

function renderAgents(agents) {
  const container = document.getElementById("agents-container");
  container.innerHTML = "";

  const selectedRole = document.getElementById("role-filter").value;
  const filtered = agents.filter(
    (a) => selectedRole === "All" || a.role?.displayName === selectedRole
  );

  filtered.forEach((agent) => {
    const card = createAgentCard(agent);
    container.appendChild(card);
  });
}

function createAgentCard(agent) {
  const card = document.createElement("div");
  card.className =
    "w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg relative overflow-hidden rounded-xl shadow-lg p-4 flex flex-col items-center text-center cursor-pointer hover:scale-105 transition-transform duration-200";

  const gradient = `linear-gradient(to bottom right, ${agent.backgroundGradientColors
    .map((c) => `#${c}`)
    .join(", ")})`;
  card.style.background = gradient;

  const name = document.createElement("h3");
  name.textContent = agent.displayName || "Unknown";
  name.className = "text-white font-semibold mb-2 z-30";

  const imgWrapper = document.createElement("div");
  imgWrapper.className =
    "relative w-[120px] h-[160px] sm:w-[150px] sm:h-[200px]";

  const displayImg = document.createElement("img");
  displayImg.src = agent.displayIcon;
  displayImg.alt = agent.displayName;
  displayImg.className =
    "absolute inset-0 w-full h-full object-contain z-20 transition-opacity duration-300 opacity-100";

  const backgroundOverlay = document.createElement("img");
  backgroundOverlay.src = agent.background;
  backgroundOverlay.alt = "Background";
  backgroundOverlay.className =
    "absolute inset-0 w-full h-full object-cover z-10 opacity-0 transition-opacity duration-300";

  const portraitImg = document.createElement("img");
  portraitImg.src =
    agent.bustPortrait || agent.fullPortrait || agent.displayIcon;
  portraitImg.alt = agent.displayName;
  portraitImg.className =
    "absolute inset-0 w-full h-full object-contain z-30 opacity-0 transition-opacity duration-300";

  imgWrapper.addEventListener("mouseenter", () => {
    displayImg.classList.replace("opacity-100", "opacity-0");
    backgroundOverlay.classList.replace("opacity-0", "opacity-100");
    portraitImg.classList.replace("opacity-0", "opacity-100");
  });

  imgWrapper.addEventListener("mouseleave", () => {
    displayImg.classList.replace("opacity-0", "opacity-100");
    backgroundOverlay.classList.replace("opacity-100", "opacity-0");
    portraitImg.classList.replace("opacity-100", "opacity-0");
  });

  const favBtn = document.createElement("button");
  favBtn.textContent = isFavorite("agents", agent.displayName) ? "★" : "☆";
  favBtn.className = "absolute top-2 right-2 text-yellow-400 text-xl z-10";
  favBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleFavorite("agents", agent.displayName);
    favBtn.textContent = isFavorite("agents", agent.displayName) ? "★" : "☆";
    renderFavoriteAgents(allAgents); // Refresh top section
  });

  imgWrapper.append(backgroundOverlay, displayImg, portraitImg);
  card.append(name, imgWrapper, favBtn);
  card.addEventListener("click", () => openModal(agent));

  return card;
}

function openModal(agent) {
  const modal = document.getElementById("agent-modal");
  const content = document.getElementById("modal-content");
  const wrapper = document.getElementById("modal-content-wrapper");

  content.innerHTML = "";

  const gradient = `linear-gradient(to bottom right, ${agent.backgroundGradientColors
    .map((c) => `#${c}`)
    .join(", ")})`;
  wrapper.style.background = gradient;

  if (agent.background) {
    content.style.backgroundImage = `url(${agent.background})`;
    content.style.backgroundSize = "cover";
    content.style.backgroundPosition = "center";
  }

  const layout = document.createElement("div");
  layout.className =
    "flex flex-col md:grid md:grid-cols-3 gap-6 items-start bg-white bg-opacity-90 p-4 rounded-lg";

  const leftCol = document.createElement("div");
  leftCol.className = "md:col-span-1 flex flex-col items-center";

  const roleimg = document.createElement("img");
  if (agent.role) {
    roleimg.src = agent.role.displayIcon;
    roleimg.alt = agent.role.displayName;
  }
  roleimg.className = "w-16 h-16 mb-2 filter invert";

  const agentrole = document.createElement("p");
  agentrole.textContent = agent.role?.displayName || "Rôle inconnu";
  agentrole.className = "font-semibold text-gray-800";

  const agentdescription = document.createElement("p");
  agentdescription.textContent =
    agent.description || "Pas de description disponible.";
  agentdescription.className =
    "text-sm text-gray-700 mt-4 px-2 md:px-0 text-justify";

  leftCol.append(roleimg, agentrole, agentdescription);

  const rightCol = document.createElement("div");
  rightCol.className = "md:col-span-2 flex flex-col items-center";

  const agentimg = document.createElement("img");
  agentimg.src = agent.fullPortrait;
  agentimg.alt = agent.displayName;
  agentimg.className =
    "w-full max-w-[300px] md:max-w-[500px] object-contain mb-2";

  const agentnameunderimg = document.createElement("h3");
  agentnameunderimg.textContent = agent.displayName;
  agentnameunderimg.className = "text-2xl font-bold text-gray-800 mt-2";

  rightCol.append(agentimg, agentnameunderimg);

  layout.append(leftCol, rightCol);
  content.append(layout);

  modal.classList.remove("hidden");
  wrapper.classList.remove("scale-95", "opacity-0");
  wrapper.classList.add("scale-100", "opacity-100");
}

document.getElementById("close-modal").addEventListener("click", () => {
  const modal = document.getElementById("agent-modal");
  const wrapper = document.getElementById("modal-content-wrapper");

  wrapper.classList.remove("scale-100", "opacity-100");
  wrapper.classList.add("scale-95", "opacity-0");

  setTimeout(() => {
    modal.classList.add("hidden");
  }, 200);
});

document.getElementById("agent-modal").addEventListener("click", (e) => {
  if (e.target.id === "agent-modal") {
    document.getElementById("close-modal").click();
  }
});

init();
