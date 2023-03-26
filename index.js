import { animate, generateCanvas } from "./helpers.js";
import { makeTerrain } from "./terrain.js";

const [CTX, canvasWidth, canvasHeight] = generateCanvas({
  width: window.innerWidth,
  height: window.innerHeight,
  attachNode: "#game",
});

const terrain = makeTerrain(CTX, canvasWidth, canvasHeight);
const landingData = terrain.getLandingData();

animate(() => {
  CTX.clearRect(0, 0, canvasWidth, canvasHeight);
  terrain.draw();

  for (let index = 0; index < landingData.numPoints; index++) {
    const segmentWidth = canvasWidth / landingData.numPoints;
    const x = index * segmentWidth + segmentWidth / 2;
    const text = `(${index}) ${terrain.getSegmentAngleAtX(x).toFixed(1)}°`;
    const textWidth = CTX.measureText(text).width;

    if (index % 2) {
      CTX.fillStyle = "rgba(255, 255, 255, 0.1)";
      CTX.fillRect(
        index * segmentWidth,
        0,
        canvasWidth / landingData.numPoints,
        canvasHeight
      );
    }

    CTX.fillStyle = "white";
    CTX.fillText(text, x - textWidth / 2, landingData.terrainHeight - 100);
    CTX.fillStyle = "rgba(255, 255, 255, 0.25)";
    CTX.fillRect(x, landingData.terrainHeight - 90, 1, canvasHeight);
  }
});
