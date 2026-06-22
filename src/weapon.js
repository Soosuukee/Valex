import { fetchWeapons } from "./fetch.js";
import { isFavorite, toggleFavorite, getFavorites } from "./favorites.js";

let allWeapons = [];

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

async function init() {
  const response = await fetchWeapons(selectedLanguage);
  allWeapons = response.data;
  populateCategoryFilter(allWeapons);
  renderFavoriteWeapons(allWeapons);
  renderWeapons(allWeapons);
}

function populateCategoryFilter(weapons) {
  const select = document.getElementById("role-filter");
  select.style.color = "black";
  const categories = [
    ...new Set(weapons.map((w) => w.shopData?.category || "Unknown")),
  ];
  categories.sort();

  categories.forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    option.style.color = "black";
    select.appendChild(option);
  });

  select.addEventListener("change", () => {
    renderWeapons(allWeapons);
  });

  document
    .getElementById("sort-select")
    .addEventListener("change", () => renderWeapons(allWeapons));
}

function renderFavoriteWeapons(weapons) {
  const favContainer = document.getElementById("favorites-container");
  favContainer.innerHTML = "";

  const favWeapons = weapons.filter((w) =>
    isFavorite("weapons", w.displayName)
  );

  if (favWeapons.length === 0) {
    document.getElementById("favorites-section").classList.add("hidden");
    return;
  }

  document.getElementById("favorites-section").classList.remove("hidden");

  favWeapons.forEach((weapon) => {
    const card = createWeaponCard(weapon);
    favContainer.appendChild(card);
  });
}

function renderWeapons(weapons) {
  const container = document.getElementById("weapons-container");
  container.innerHTML = "";

  const selectedCategory = document.getElementById("role-filter");
  selectedCategory.style.color = "black";

  const sortSelect = document.getElementById("sort-select");
  sortSelect.style.color = "black";

  const selectedCategoryValue = selectedCategory.value;
  const sortOption = sortSelect.value;

  let filtered = weapons.filter(
    (w) =>
      selectedCategoryValue === "All" ||
      w.shopData?.category === selectedCategoryValue
  );

  if (sortOption === "price") {
    filtered.sort((a, b) => (a.shopData?.cost || 0) - (b.shopData?.cost || 0));
  } else if (sortOption === "hs") {
    filtered.sort((a, b) => {
      const getHS = (w) => w.weaponStats?.damageRanges?.[0]?.headDamage || 0;
      return getHS(b) - getHS(a);
    });
  }

  filtered.forEach((weapon) => {
    const card = createWeaponCard(weapon);
    container.appendChild(card);
  });
}

function createWeaponCard(weapon) {
  const card = document.createElement("div");
  card.className =
    "relative w-full max-w-xs sm:max-w-sm md:max-w-md rounded-xl shadow-lg p-4 flex flex-col items-center text-center cursor-pointer hover:scale-105 transition-transform duration-200 bg-black/70 backdrop-blur-sm";

  const name = document.createElement("p");
  name.textContent = weapon.displayName;
  name.className = "text-white font-semibold mb-3";

  const img = document.createElement("img");
  img.src = weapon.shopData?.newImage || weapon.displayIcon;
  img.className = "w-48 h-24 object-contain mb-2";
  img.alt = weapon.displayName;

  const favBtn = document.createElement("button");
  favBtn.textContent = isFavorite("weapons", weapon.displayName) ? "★" : "☆";
  favBtn.className = "absolute top-2 right-2 text-yellow-400 text-xl z-10";
  favBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleFavorite("weapons", weapon.displayName);
    favBtn.textContent = isFavorite("weapons", weapon.displayName) ? "★" : "☆";
    renderFavoriteWeapons(allWeapons);
  });

  card.append(name, img, favBtn);
  card.addEventListener("click", () => openModal(weapon));

  return card;
}

function openModal(weapon) {
  const modal = document.getElementById("weapon-modal");
  const content = document.getElementById("modal-content");
  const wrapper = document.getElementById("modal-content-wrapper");

  content.innerHTML = "";

  const weaponname = document.createElement("h4");
  weaponname.textContent = weapon.displayName;
  weaponname.className = "text-2xl font-bold mb-2 text-center text-black";

  const weaponimg = document.createElement("img");
  weaponimg.src = weapon.shopData?.newImage || weapon.displayIcon;
  weaponimg.alt = weapon.displayName;
  weaponimg.className = "mx-auto w-56 h-28 object-contain mb-4";

  const weaponcategory = document.createElement("p");
  weaponcategory.className = "text-lg font-semibold text-black";
  weaponcategory.textContent =
    weapon.displayName === "Melee"
      ? "Knife"
      : weapon.shopData?.category || "Unknown Category";

  const cost = document.createElement("p");
  cost.className = "text-md text-black";
  cost.textContent = `💰 Cost: ${weapon.shopData?.cost || "N/A"} credits`;

  const wallPen = document.createElement("p");
  wallPen.className = "text-md text-black";
  const penetration =
    weapon.weaponStats?.wallPenetration?.split("::")[1] || "Unknown";
  wallPen.textContent = `🧱 Wall Penetration: ${penetration}`;

  const damageWrapper = document.createElement("div");
  damageWrapper.className = "mt-4";

  const dmgTitle = document.createElement("h5");
  dmgTitle.textContent = "💥 Damage by Range:";
  dmgTitle.className = "font-semibold text-black mb-1";

  damageWrapper.appendChild(dmgTitle);

  const ranges = weapon.weaponStats?.damageRanges || [];
  ranges.forEach((range) => {
    const p = document.createElement("p");
    p.className = "text-sm text-red-500";
    p.textContent = `From ${range.rangeStartMeters}m to ${range.rangeEndMeters}m → 🧠 ${range.headDamage} | 💪 ${range.bodyDamage} | 🦵 ${range.legDamage}`;
    damageWrapper.appendChild(p);
  });

  const viewSkinsBtn = document.createElement("a");
  viewSkinsBtn.href = `weapon_view.html?weapon=${encodeURIComponent(
    weapon.displayName
  )}`;
  viewSkinsBtn.textContent = "See all skins ";
  viewSkinsBtn.className =
    "mt-4 bg-black text-white px-4 py-2 rounded hover:bg-gray-800 inline-block";

  content.append(
    weaponname,
    weaponimg,
    weaponcategory,
    cost,
    wallPen,
    damageWrapper,
    viewSkinsBtn
  );

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

  document.getElementById("weapon-modal").addEventListener("click", (e) => {
    if (e.target.id === "weapon-modal") {
      document.getElementById("close-modal").click();
    }
  });
}

init();
