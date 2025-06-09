import { fetchWeapons } from "./fetch.js";

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

let weapons = [];

const modal = document.getElementById("skin-modal");
const wrapper = document.getElementById("modal-content-wrapper");
const videoContainer = document.getElementById("skin-modal-container");

function getWeaponFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("weapon");
}

async function init() {
  try {
    const response = await fetchWeapons(selectedLanguage);
    weapons = response.data;
    renderSkins(weapons);
  } catch (err) {
    console.error("Failed to load weapons:", err);
  }
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
      wallpaper: skin.wallpaper || weapon.wallpaper,
    }))
  );

  const filteredSkins = allSkins.filter((skin) => {
    // ❌ Écarter "Standard" (ex: "Vandal") et "Random Favorite Skin"
    if (
      skin.displayName === skin.weaponName ||
      skin.displayName === "Random Favorite Skin"
    ) {
      return false;
    }
    if (!skin.contentTierUuid) return false;
    if (weaponFilter && skin.weaponName !== weaponFilter) return false;
    return !filterTier || skin.contentTierUuid === filterTier;
  });

  filteredSkins.forEach((skin) => {
    const card = document.createElement("div");
    card.className = `
      w-full max-w-xs sm:max-w-sm md:max-w-md 
      relative rounded-lg shadow-lg p-4 flex flex-col items-center
      bg-black bg-opacity-80 text-white cursor-pointer transition-transform
      hover:scale-105 duration-200 overflow-hidden
    `;
    card.style.aspectRatio = "16 / 9";
    card.style.backgroundSize = "cover";
    card.style.backgroundPosition = "center";

    if (skin.wallpaper) {
      card.style.backgroundImage = `url(${skin.wallpaper})`;
    }

    const overlay = document.createElement("div");
    overlay.className = "absolute inset-0 bg-black bg-opacity-60 z-0";
    card.appendChild(overlay);

    const name = document.createElement("p");
    name.textContent = skin.displayName;
    name.className = "z-10 text-sm font-semibold mb-2";

    const mainimg = document.createElement("img");
    const defaultRender =
      skin.displayIcon || skin.chromas?.[0]?.fullRender || skin.fallbackIcon;
    mainimg.src = defaultRender;
    mainimg.alt = skin.displayName;
    mainimg.className = "z-10 w-28 h-auto mb-2";

    let currentVideoUrl =
      skin.chromas?.[0]?.streamedVideo ||
      skin.levels
        ?.slice()
        .reverse()
        .find((l) => l.streamedVideo)?.streamedVideo;
    mainimg.dataset.videoUrl = currentVideoUrl || "";

    mainimg.addEventListener("dblclick", () => {
      const videoUrl = mainimg.dataset.videoUrl;
      if (videoUrl) openVideoModal(videoUrl);
    });

    let hoverTimeout;
    mainimg.addEventListener("mouseenter", () => {
      if (skin.wallpaper) {
        hoverTimeout = setTimeout(() => {
          openImageModal(skin.wallpaper, mainimg.src);
        }, 2000);
      }
    });
    mainimg.addEventListener("mouseleave", () => clearTimeout(hoverTimeout));

    card.append(name, mainimg);

    // 🎨 Chromas
    if (skin.chromas?.length > 1) {
      const chromaContainer = document.createElement("div");
      chromaContainer.className = "flex flex-wrap gap-1 mt-2 z-10";

      skin.chromas.forEach((chroma, index) => {
        if (!chroma.fullRender) return;

        const chromaImg = document.createElement("img");
        chromaImg.src = chroma.swatch;
        chromaImg.alt = chroma.displayName;
        chromaImg.style.width = "40px";
        chromaImg.className = "rounded border";

        chromaImg.addEventListener("click", () => {
          mainimg.src = chroma.fullRender;
          let videoUrl = chroma.streamedVideo;

          if (!videoUrl && index === 0) {
            videoUrl = skin.levels
              ?.slice()
              .reverse()
              .find((l) => l.streamedVideo)?.streamedVideo;
          }

          mainimg.dataset.videoUrl = videoUrl || "";
        });

        chromaContainer.appendChild(chromaImg);
      });

      card.appendChild(chromaContainer);
    }

    container.appendChild(card);
  });

  if (container.children.length === 0) {
    const message = document.createElement("p");
    message.textContent = "Aucun skin trouvé pour cette arme ou ce tier.";
    message.className = "text-center text-gray-500 col-span-full";
    container.appendChild(message);
  }
}

function openVideoModal(videoUrl) {
  videoContainer.innerHTML = "";
  const video = document.createElement("video");
  video.src = videoUrl;
  video.controls = true;
  video.autoplay = true;
  video.className = "w-full h-auto max-h-[60vh] rounded object-contain";
  videoContainer.appendChild(video);
  showModal();
}

function openImageModal(bgUrl, imgUrl) {
  videoContainer.innerHTML = "";

  const container = document.createElement("div");
  container.className =
    "w-full h-auto max-h-[60vh] bg-cover bg-center rounded flex justify-center items-center";
  container.style.backgroundImage = `url(${bgUrl})`;

  const weaponImg = document.createElement("img");
  weaponImg.src = imgUrl;
  weaponImg.alt = "Weapon Preview";
  weaponImg.className = "max-h-[40vh] object-contain";

  container.appendChild(weaponImg);
  videoContainer.appendChild(container);
  showModal();
}

function showModal() {
  modal.classList.remove("hidden");
  wrapper.classList.remove("scale-95", "opacity-0");
  wrapper.classList.add("scale-100", "opacity-100");
}

document.getElementById("close-modal").addEventListener("click", () => {
  const video = videoContainer.querySelector("video");
  if (video) video.pause();
  closeModal();
});

modal.addEventListener("click", (e) => {
  if (e.target.id === "skin-modal") {
    const video = videoContainer.querySelector("video");
    if (video) video.pause();
    closeModal();
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    const video = videoContainer.querySelector("video");
    if (video) video.pause();
    closeModal();
  }

  if (e.key.toLowerCase() === "f") {
    const video = videoContainer.querySelector("video");
    if (video && video.requestFullscreen) {
      video.requestFullscreen();
    }
  }
});

function closeModal() {
  wrapper.classList.remove("scale-100", "opacity-100");
  wrapper.classList.add("scale-95", "opacity-0");
  setTimeout(() => {
    modal.classList.add("hidden");
    videoContainer.innerHTML = "";
  }, 200);
}

init();
