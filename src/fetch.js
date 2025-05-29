
export async function fetchAgents() {
  const response = await fetch("https://valorant-api.com/v1/agents");
  const data = await response.json();
  return data;
}

export async function fetchMaps() {
  const response = await fetch("https://valorant-api.com/v1/maps");
  const data = await response.json();
  return data;
}

export async function fetchWeapons() {
  const response = await fetch("https://valorant-api.com/v1/weapons");
  const data = await response.json();
  return data;
}
