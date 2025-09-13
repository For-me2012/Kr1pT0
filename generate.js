const fs = require('fs');
const path = require('path');

const files = {
  "index.html": `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Fanmade Fortnite 2</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div id="hud">Weapon: Pistol</div>
  <canvas id="game"></canvas>
  <script src="https://cdn.jsdelivr.net/npm/three@0.152.2/build/three.min.js"></script>
  <script src="client.js"></script>
</body>
</html>`,

  "style.css": `body {
  margin: 0;
  overflow: hidden;
  background: black;
}
#hud {
  position: fixed;
  top: 10px;
  left: 10px;
  color: white;
  font-family: Arial, sans-serif;
  font-size: 20px;
  z-index: 10;
}
canvas {
  display: block;
}`,

  "client.js": `const canvas = document.getElementById("game");
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.set(0, 1.8, 5);

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(500, 500),
  new THREE.MeshBasicMaterial({ color: 0x228B22 })
);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

const hud = document.getElementById("hud");
const weapons = ["Pistol", "Shotgun", "Rifle"];
let currentWeapon = 0;

document.addEventListener("keydown", (e) => {
  if (e.key === "1") currentWeapon = 0;
  if (e.key === "2") currentWeapon = 1;
  if (e.key === "3") currentWeapon = 2;
  hud.innerText = "Weapon: " + weapons[currentWeapon];
  if (e.key === " ") console.log("Shoot " + weapons[currentWeapon]);
});

let pitch = 0, yaw = 0;
document.body.requestPointerLock = document.body.requestPointerLock || document.body.mozRequestPointerLock;
document.body.onclick = () => document.body.requestPointerLock();

document.addEventListener("mousemove", (e) => {
  yaw -= e.movementX * 0.002;
  pitch -= e.movementY * 0.002;
  camera.rotation.set(pitch, yaw, 0);
});

let pos = { x: 0, y: 1.8, z: 0 };
document.addEventListener("keydown", (e) => {
  const speed = 0.2;
  if (e.key === "w") pos.z -= Math.cos(yaw) * speed;
  if (e.key === "s") pos.z += Math.cos(yaw) * speed;
  if (e.key === "a") pos.x -= Math.cos(yaw + Math.PI/2) * speed;
  if (e.key === "d") pos.x += Math.cos(yaw + Math.PI/2) * speed;
  camera.position.set(pos.x, pos.y, pos.z);
});

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();`,

  "server.js": `const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("."));

let players = {};

io.on("connection", (socket) => {
  players[socket.id] = { x: 0, y: 1.8, z: 0 };

  socket.on("move", (p) => {
    players[socket.id] = p;
    io.emit("update", players);
  });

  socket.on("shoot", (data) => console.log(\`\${socket.id} shot with \${data.weapon}\`));

  socket.on("disconnect", () => {
    delete players[socket.id];
    io.emit("update", players);
  });
});

server.listen(3000, () => console.log("Server running at http://localhost:3000"));`,

  "package.json": `{
  "name": "fortnite2",
  "version": "1.0.0",
  "main": "server.js",
  "dependencies": {
    "express": "^4.18.2",
    "socket.io": "^4.7.5"
  }
}`
};

for (const [filename, content] of Object.entries(files)) {
  fs.writeFileSync(path.join(__dirname, filename), content);
  console.log(\`Created: \${filename}\`);
}
