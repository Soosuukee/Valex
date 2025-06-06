import { fetchWeapons } from "./fetch.js";

let allWeapons = [];

async function init() {
  const response = await fetchWeapons();
  allWeapons = response.data;
  populateCategoryFilter(allWeapons);
  renderWeapons(allWeapons);
}

function populateCategoryFilter(weapons) {
  const select = document.getElementById("role-filter");
  const categories = [
    ...new Set(weapons.map((w) => w.shopData?.category || "Unknown")),
  ];
  categories.sort();

  categories.forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    select.appendChild(option);
  });

  select.addEventListener("change", () => renderWeapons(allWeapons));
  document
    .getElementById("sort-select")
    .addEventListener("change", () => renderWeapons(allWeapons));
}

function renderWeapons(weapons) {
  const container = document.getElementById("weapons-container");
  container.innerHTML = "";

  const selectedCategory = document.getElementById("role-filter").value;
  const sortOption = document.getElementById("sort-select").value;

  let filtered = weapons.filter(
    (w) =>
      selectedCategory === "All" || w.shopData?.category === selectedCategory
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
    const card = document.createElement("div");
    card.className =
      "w-full max-w-xs sm:max-w-sm md:max-w-md rounded-xl shadow-lg p-4 flex flex-col items-center text-center cursor-pointer hover:scale-105 transition-transform duration-200";

    const name = document.createElement("p");
    name.textContent = weapon.displayName;

    const img = document.createElement("img");
    img.src = weapon.displayIcon;
    img.className = "w-32 h-auto mb-2";
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
  weaponname.className = "text-2xl font-bold mb-2 text-center text-black";

  const weaponimg = document.createElement("img");
  weaponimg.src = weapon.displayIcon;
  weaponimg.alt = weapon.displayName;
  weaponimg.className = "mx-auto w-48 mb-4";

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

  // 📈 Damage Ranges
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

  // 🔗 View Skins
  const viewSkinsBtn = document.createElement("a");
  viewSkinsBtn.href = `weapon_view.html?weapon=${encodeURIComponent(
    weapon.displayName
  )}`;
  viewSkinsBtn.textContent = "See all skins ";
  viewSkinsBtn.className =
    "mt-4 bg-black text-white px-4 py-2 rounded hover:bg-gray-800 inline-block";

  // 📦 Append all
  content.append(
    weaponname,
    weaponimg,
    weaponcategory,
    cost,
    wallPen,
    damageWrapper,
    viewSkinsBtn
  );

  // 🎬 Show modal
  modal.classList.remove("hidden");
  wrapper.classList.remove("scale-95", "opacity-0");
  wrapper.classList.add("scale-100", "opacity-100");

  // ❌ Close logic
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
