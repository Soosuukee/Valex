
const callouts = [
  { name: "Tree", x: 3980.9062, y: -5938.758 },
  { name: "Lobby A", x: 4489.032, y: -3014.0515 },
  { name: "Main A", x: 5321.6206, y: -4710.1274 },
  { name: "Window", x: 4023.0244, y: -8180.692 },
  { name: "Site A", x: 6153.585, y: -6626.2114 },
  { name: "Attacker Spawn", x: 60, y: 50 },
  { name: "Lobby B", x: -1490.5864, y: -1389.9706 },
  { name: "Main B", x: -1983.6713, y: -5840.8125 },
  { name: "Boat House", x: -4484.774, y: -7763.3584 },
  { name: "Bottom Mid", x: 1122.2262, y: -5951.704 },
  { name: "Site B", x: -2344.065, y: -7548.511 },
  { name: "Catwalk", x: 2315.7944, y: -4127.2554 },
  { name: "Cubby", x: 3387.3167, y: -5129.764 },
  { name: "Defender Spawn", x: 1995.2354, y: -9744.923 },
  { name: "Garden", x: 3773.6653, y: -7551.3535 },
  { name: "Market", x: 1089.1044, y: -7363.1914 },
  { name: "Courtyard", x: 1222.7029, y: -4586.6 },
  { name: "Link", x: -632.0929, y: -4280.2573 },
  { name: "Pizza", x: 1801.5667, y: -7262.1704 },
  { name: "Rafters", x: 6129.893, y: -8210 },
  { name: "Top Mid", x: 2753.9297, y: -2129.6155 },
  { name: "Wine", x: 7358.7407, y: -4689.2705 }
];

// Transformation coefficients
const xMultiplier = 0.01087;
const yMultiplier = 0.15203;
const xScalarToAdd = 1656.93;

const xMultiplierY = -0.14403;
const yMultiplierY = 0.00653;
const yScalarToAdd = 1200.73;

const map = document.getElementById("mapImage");
const container = document.getElementById("mapContainer");

map.onload = () => {
  const width = map.naturalWidth;
  const height = map.naturalHeight;

  callouts.forEach(({ name, x, y }) => {
    const absoluteX = (x * xMultiplier) + (y * yMultiplier) + xScalarToAdd;
    const absoluteY = (x * xMultiplierY) + (y * yMultiplierY) + yScalarToAdd;

    const percentX = (absoluteX / width) * 100;
    const percentY = (absoluteY / height) * 100;

    console.log(name, percentX.toFixed(2), percentY.toFixed(2));

    const div = document.createElement("div");
    div.className = "absolute bg-red-600 text-white text-xs font-bold px-1 py-[1px] rounded transform -translate-x-1/2 -translate-y-1/2 pointer-events-none";
    div.style.left = `${percentX}%`;
    div.style.top = `${percentY}%`;
    div.textContent = name;
    container.appendChild(div);
  });
};
