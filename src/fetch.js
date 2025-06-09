export async function fetchAgents(language = "en-US") {
  const res = await fetch(
    `https://valorant-api.com/v1/agents?language=${language}`
  );
  return await res.json();
}

export async function fetchMaps(language = "en-US") {
  const res = await fetch(
    `https://valorant-api.com/v1/maps?language=${language}`
  );
  return await res.json();
}

export async function fetchWeapons(language = "en-US") {
  const res = await fetch(
    `https://valorant-api.com/v1/weapons?language=${language}`
  );
  return await res.json();
}
