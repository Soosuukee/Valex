import { fetchAgents, fetchMaps, fetchWeapons } from "./fetch.js";

const allowedWeaponTiers = [
  "e046854e-406c-37f4-6607-19a9ba8426fc", // Premium
  "60bca009-4182-7998-dee7-b8a2558dc369", // Exclusive
  "411e4a55-4e59-7757-41f0-86a53f101bb5", // Ultra
];

async function loadRandomImages() {
  const [agents, maps, weapons] = await Promise.all([
    fetchAgents(),
    fetchMaps(),
    fetchWeapons(),
  ]);

  const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];

  // === AGENT ===
  const playableAgents = agents.data.filter(
    (a) =>
      a.isPlayableCharacter &&
      a.fullPortrait &&
      a.background &&
      a.backgroundGradientColors?.length === 4
  );
  const randomAgent = rand(playableAgents);

  const card_agent = document.getElementById("agent-content");
  card_agent.innerHTML = "";
  card_agent.classList.add("relative", "overflow-hidden", "rounded-lg");

  const gradientLayer = document.createElement("div");
  gradientLayer.className = "absolute inset-0 z-0";
  gradientLayer.style.background = `linear-gradient(to bottom right, #${randomAgent.backgroundGradientColors[0]}, #${randomAgent.backgroundGradientColors[1]}, #${randomAgent.backgroundGradientColors[2]}, #${randomAgent.backgroundGradientColors[3]})`;
  card_agent.appendChild(gradientLayer);

  const backgroundImg = document.createElement("img");
  backgroundImg.src = randomAgent.background;
  backgroundImg.alt = "Agent background";
  backgroundImg.className =
    "absolute inset-0 w-full h-full object-cover z-10 opacity-60";
  card_agent.appendChild(backgroundImg);

  const bust = document.createElement("img");
  bust.src = randomAgent.fullPortrait;
  bust.alt = randomAgent.displayName;
  bust.className =
    "relative z-20 max-h-[300px] w-auto object-contain mx-auto my-4";
  card_agent.appendChild(bust);

  const title = document.createElement("h2");
  title.textContent = "Agents";
  title.className =
    "absolute bottom-2 left-2 z-30 bg-black/60 px-3 py-1 rounded text-base md:text-lg font-semibold text-white";
  card_agent.appendChild(title);

  // === MAP ===
  const map = rand(maps.data.filter((m) => m.tacticalDescription?.trim()));
  const card_map = document.getElementById("map-content");
  card_map.innerHTML = "";
  card_map.classList.add("relative", "overflow-hidden", "rounded-lg");
  card_map.style.backgroundImage = `url(${map.splash})`;
  card_map.style.backgroundSize = "cover";
  card_map.style.backgroundPosition = "center";

  const mapTitle = document.createElement("h2");
  mapTitle.textContent = "Maps";
  mapTitle.className =
    "absolute bottom-2 left-2 bg-black/60 px-3 py-1 rounded text-base md:text-lg font-bold text-white";
  card_map.append(mapTitle);

  // === WEAPON ===
  const validWeapons = weapons.data.filter((w) => w.displayName !== "Melee");
  const skins = validWeapons.flatMap((w) =>
    w.skins
      .filter((s) => allowedWeaponTiers.includes(s.contentTierUuid))
      .map((s) => s.chromas?.find((c) => c.fullRender))
      .filter(Boolean)
  );
  const randomSkin = rand(skins);

  const card_weapon = document.getElementById("weapon-content");
  card_weapon.innerHTML = "";
  card_weapon.classList.add("relative", "overflow-hidden", "rounded-lg");

  const weaponImg = document.createElement("img");
  weaponImg.src = randomSkin.fullRender;
  weaponImg.alt = "Weapon";
  weaponImg.className = "absolute inset-0 w-full h-full object-contain z-10";
  card_weapon.appendChild(weaponImg);

  const weaponTitle = document.createElement("h2");
  weaponTitle.textContent = "Weapons";
  weaponTitle.className =
    "absolute bottom-2 left-2 bg-black/60 px-3 py-1 rounded text-base md:text-lg font-bold z-20 text-white";
  card_weapon.appendChild(weaponTitle);
}

loadRandomImages();
