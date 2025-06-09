// favorites.js

/**
 * Récupère les favoris stockés dans localStorage pour un type donné.
 * @param {"maps"|"weapons"|"skins"|"agents"} type
 * @returns {string[]} Liste des noms/identifiants favoris
 */
export function getFavorites(type) {
  const raw = localStorage.getItem("valex_favorites");
  const data = raw ? JSON.parse(raw) : {};
  return data[type] || [];
}

/**
 * Ajoute ou retire un favori pour un type donné.
 * @param {"maps"|"weapons"|"skins"|"agents"} type
 * @param {string} name Le nom ou l'identifiant unique de l'élément
 */
export function toggleFavorite(type, name) {
  const raw = localStorage.getItem("valex_favorites");
  const data = raw ? JSON.parse(raw) : {};

  if (!data[type]) data[type] = [];

  const index = data[type].indexOf(name);
  if (index === -1) {
    data[type].push(name); // Ajout
  } else {
    data[type].splice(index, 1); // Suppression
  }

  localStorage.setItem("valex_favorites", JSON.stringify(data));
}

/**
 * Vérifie si un élément est dans les favoris.
 * @param {"maps"|"weapons"|"skins"|"agents"} type
 * @param {string} name Le nom ou identifiant à vérifier
 * @returns {boolean}
 */
export function isFavorite(type, name) {
  return getFavorites(type).includes(name);
}
