import { fetchWeapons } from "./fetch.js";

let weapons = [];

function getWeaponFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("weapon");
}

async function init() {
  const response = await fetchWeapons();
  weapons = response.data;
  renderSkins(weapons);
}

document.getElementById("tier-filter").addEventListener("change", (e) => {
  const selectedTier = e.target.value;
  renderSkins(weapons, selectedTier);
});

function renderSkins(weapons, filterTier = "") {
  const container = document.getElementById("skins-container");
  container.innerHTML = "";

  const weaponFilter = getWeaponFromURL();

  const allSkins = weapons.flatMap((weapon) =>
    weapon.skins.map((skin) => ({
      ...skin,
      weaponName: weapon.displayName,
      fallbackIcon: weapon.displayIcon,
    }))
  );

  const filteredSkins = allSkins.filter((skin) => {
    if (!skin.contentTierUuid) return false;
    if (weaponFilter && skin.weaponName !== weaponFilter) return false;
    return !filterTier || skin.contentTierUuid === filterTier;
  });

  filteredSkins.forEach((skin) => {
    const card = document.createElement("div");
    card.className = "rounded-xl shadow p-4 flex flex-col items-center";

    const name = document.createElement("p");
    name.textContent = skin.displayName;

    const img = document.createElement("img");
    img.src = skin.displayIcon || skin.fallbackIcon;
    img.alt = skin.displayName;
    img.style.width = "150px";

    card.append(name, img);
    container.appendChild(card);
  });

  if (container.children.length === 0) {
    const message = document.createElement("p");
    message.textContent = "Aucun skin trouvé pour cette arme ou ce tier.";
    message.className = "text-center text-gray-500 col-span-full";
    container.appendChild(message);
  }
}

init();
