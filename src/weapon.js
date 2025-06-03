import { fetchWeapons } from "./fetch.js";

async function init() {
  const response = await fetchWeapons();
  const weapons = response.data;
  renderWeapons(weapons);
}

function renderWeapons(weapons) {
  const container = document.getElementById("weapons-container");

  weapons.forEach((weapon) => {
    const card = document.createElement("div");
    card.className =
      "rounded-xl shadow-lg p-4 flex flex-col items-center text-center cursor-pointer hover:scale-105 transition-transform duration-200";

    const name = document.createElement("p");
    name.textContent = weapon.displayName;

    const img = document.createElement("img");
    img.src = weapon.displayIcon;
    img.alt = name;
    img.style.width = "150px";

    card.append(name, img);
    card.addEventListener("click", () => openModal(weapon));

    container.appendChild(card);
  });
}

function openModal(weapon) {
  const modal = document.getElementById("weapon-modal");
  const content = document.getElementById("modal-content");
  const wrapper = document.getElementById("modal-content-wrapper");

  content.innerHTML = "";

  const weaponname = document.createElement("h4");
  weaponname.textContent = weapon.displayName;

  const weaponimg = document.createElement("img");
  weaponimg.src = weapon.displayIcon;
  weaponimg.alt = weaponname;
  weaponimg.className = "mx-auto w-48 mb-4";

  const weaponcategory = document.createElement("p");
  weaponcategory.className = "text-xl font-bold mb-2";

  const viewSkinsBtn = document.createElement("a");
  viewSkinsBtn.href = `weapon_view.html?weapon=${encodeURIComponent(
    weapon.displayName
  )}`;
  viewSkinsBtn.textContent = "Voir les skins";
  viewSkinsBtn.className =
    "mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600";

  if (weapon.displayName === "Melee") {
    weaponcategory.textContent = "Knife";
  } else {
    weaponcategory.textContent = weapon.shopData.category;
  }
  content.append(weaponname, weaponimg, weaponcategory, viewSkinsBtn);

  modal.classList.remove("hidden");

  wrapper.classList.remove("scale-95", "opacity-0");
  wrapper.classList.add("scale-100", "opacity-100");

  document.getElementById("close-modal").addEventListener("click", () => {
    const modal = document.getElementById("weapon-modal");
    const wrapper = document.getElementById("modal-content-wrapper");

    wrapper.classList.remove("scale-100", "opacity-100");
    wrapper.classList.add("scale-95", "opacity-0");

    setTimeout(() => {
      modal.classList.add("hidden");
    }, 200);
  });

  document.getElementById("weapon-modal").addEventListener("click", (e) => {
    if (e.target.id === "weapon-modal") {
      document.getElementById("close-modal").click();
    }
  });
}
init();
