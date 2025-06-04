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
    (agent) => agent.isPlayableCharacter
  );
  const randomAgent = rand(playableAgents);

  const card_agent = document.getElementById("agent-content");
  const card_agent_title = document.createElement("h2");
  card_agent_title.textContent = "Agents";
  card_agent_title.className =
    "bg-black/50 px-4 py-2 rounded text-lg font-semibold";
  card_agent.style.backgroundImage = `url(${randomAgent.fullPortrait})`;
  card_agent.append(card_agent_title);

  // === MAP ===
  const playableMaps = maps.data.filter((map) =>
    map.tacticalDescription?.trim()
  );
  const randomMap = rand(playableMaps);

  const card_map = document.getElementById("map-content");
  const card_map_title = document.createElement("h2");
  card_map_title.textContent = "Maps";
  card_map_title.className =
    "bg-black/50 px-4 py-2 rounded text-lg font-semibold";
  card_map.style.backgroundImage = `url(${randomMap.splash})`;
  card_map.append(card_map_title);

  // === WEAPON + SKIN (depuis chromas) ===
  const displayableWeapons = weapons.data
    .filter((weapon) => weapon.displayName !== "Melee")
    .map((weapon) => {
      const validSkins = weapon.skins
        ?.map((skin) => {
          const chromaWithImage = skin.chromas?.find(
            (chroma) => chroma.fullRender
          );
          if (
            allowedWeaponTiers.includes(skin.contentTierUuid) &&
            chromaWithImage
          ) {
            return {
              displayName: skin.displayName,
              fullRender: chromaWithImage.fullRender,
            };
          }
          return null;
        })
        .filter(Boolean); // filtre les null
      return {
        ...weapon,
        skins: validSkins ?? [],
      };
    })
    .filter((weapon) => weapon.skins.length > 0);

  if (displayableWeapons.length === 0) {
    console.warn("Aucune arme avec skin image valide trouvée.");
    return;
  }

  const randomWeapon = rand(displayableWeapons);
  const randomSkin = rand(randomWeapon.skins);

  const card_weapon = document.getElementById("weapon-content");
  const card_weapon_title = document.createElement("h2");
  card_weapon_title.textContent = "Weapons";
  card_weapon_title.className =
    "bg-black/50 px-4 py-2 rounded text-lg font-semibold";
  card_weapon.style.backgroundImage = `url(${randomSkin.fullRender})`;
  card_weapon.append(card_weapon_title);
}

loadRandomImages();
