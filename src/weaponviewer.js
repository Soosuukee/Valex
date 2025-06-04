import { fetchWeapons } from "./fetch.js";

let weapons = [];

const modal = document.getElementById("skin-modal");
const wrapper = document.getElementById("modal-content-wrapper");
const videoContainer = document.getElementById("skin-modal-container");

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

    const mainimg = document.createElement("img");
    const defaultRender =
      skin.displayIcon || skin.chromas?.[0]?.fullRender || skin.fallbackIcon;
    mainimg.src = defaultRender;
    mainimg.alt = skin.displayName;
    mainimg.style.width = "150px";

    // Vidéo par défaut (chroma[0] si dispo sinon level fallback)
    let currentVideoUrl =
      skin.chromas?.[0]?.streamedVideo ||
      skin.levels
        ?.slice()
        .reverse()
        .find((l) => l.streamedVideo)?.streamedVideo;
    mainimg.dataset.videoUrl = currentVideoUrl || "";

    card.append(name, mainimg);

    // ▶️ Clic sur l'image principale = lire la vidéo du chroma sélectionné ou fallback
    mainimg.addEventListener("click", () => {
      const videoUrl = mainimg.dataset.videoUrl;
      if (videoUrl) {
        openVideoModal(videoUrl);
      }
    });

    // 🎨 Chromas
    if (skin.chromas?.length > 1) {
      const chromaContainer = document.createElement("div");
      chromaContainer.className = "flex flex-wrap gap-1 mt-2";

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
  modal.classList.remove("hidden");
  wrapper.classList.remove("scale-95", "opacity-0");
  wrapper.classList.add("scale-100", "opacity-100");
}

document.getElementById("close-modal").addEventListener("click", () => {
  const video = videoContainer.querySelector("video");
  if (video) video.pause();
  wrapper.classList.remove("scale-100", "opacity-100");
  wrapper.classList.add("scale-95", "opacity-0");
  setTimeout(() => {
    modal.classList.add("hidden");
    videoContainer.innerHTML = "";
  }, 200);
});

modal.addEventListener("click", (e) => {
  if (e.target.id === "skin-modal") {
    const video = videoContainer.querySelector("video");
    if (video) video.pause();
    wrapper.classList.remove("scale-100", "opacity-100");
    wrapper.classList.add("scale-95", "opacity-0");
    setTimeout(() => {
      modal.classList.add("hidden");
      videoContainer.innerHTML = "";
    }, 200);
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    const video = videoContainer.querySelector("video");
    if (video) video.pause();
    wrapper.classList.remove("scale-100", "opacity-100");
    wrapper.classList.add("scale-95", "opacity-0");
    setTimeout(() => {
      modal.classList.add("hidden");
      videoContainer.innerHTML = "";
    }, 200);
  }

  // Plein écran avec F
  if (e.key.toLowerCase() === "f") {
    const video = videoContainer.querySelector("video");
    if (video && video.requestFullscreen) {
      video.requestFullscreen();
    }
  }
});

init();
