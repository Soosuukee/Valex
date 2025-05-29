import { fetchAgents } from './fetch.js';

async function init() {
  const response = await fetchAgents();
  const agents = response.data;
  renderAgents(agents);
}

function renderAgents(agents) {
  const container = document.getElementById("agents-container");

  agents.forEach(agent => {
    if (agent.isPlayableCharacter) {
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

function openModal(agent) {
  const modal = document.getElementById("agent-modal");
  const content = document.getElementById("modal-content");
  const wrapper = document.getElementById("modal-content-wrapper");

  content.innerHTML = "";

  const agentname = document.createElement("h4");
  agentname.textContent = agent.displayName;
  agentname.className = "text-xl font-bold mb-2";

  const agentimg = document.createElement("img");
  agentimg.src = agent.fullPortrait;
  agentimg.alt = agent.displayName;
  agentimg.className = "mx-auto w-48 mb-4";

  const agentrole = document.createElement("h5");
  agentrole.textContent = agent.role?.displayName || "Rôle inconnu";
  agentrole.className = "font-bold text-sm text-gray-600";

  const agentdescription = document.createElement("p");
  agentdescription.textContent = agent.description || "Pas de description disponible.";
  agentdescription.className = "text-sm mt-2";

  content.append(agentname, agentimg, agentrole, agentdescription);

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
