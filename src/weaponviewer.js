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

    let currentVideoUrl =
      skin.chromas?.[0]?.streamedVideo ||
      skin.levels
        ?.slice()
        .reverse()
        .find((l) => l.streamedVideo)?.streamedVideo;
    mainimg.dataset.videoUrl = currentVideoUrl || "";

    // Double clic = jouer la vidéo
    mainimg.addEventListener("dblclick", () => {
      const videoUrl = mainimg.dataset.videoUrl;
      if (videoUrl) {
        openVideoModal(videoUrl);
      }
    });

    // Hover prolongé = montrer wallpaper si dispo
    let hoverTimeout;
    mainimg.addEventListener("mouseenter", () => {
      if (skin.wallpaper) {
        hoverTimeout = setTimeout(() => {
          openImageModal(skin.wallpaper, mainimg.src);
        }, 2000);
      }
    });
    mainimg.addEventListener("mouseleave", () => {
      clearTimeout(hoverTimeout);
    });

    card.append(name, mainimg);

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
