import { animate, generateCanvas } from "./helpers.js";
import { makeTerrain } from "./terrain.js";
import { makeBall } from "./ball.js";

const [CTX, canvasWidth, canvasHeight, scaleFactor] = generateCanvas({
  width: window.innerWidth,
  height: window.innerHeight,
  attachNode: "#game",
});

const terrain = makeTerrain(CTX, canvasWidth, canvasHeight);
const landingData = terrain.getLandingData();

const balls = new Array(20)
  .fill()
  .map(() =>
    makeBall(
      CTX,
      canvasWidth,
      scaleFactor,
      landingData,
      terrain.getSegmentAngleAtX
    )
  );

animate(() => {
  CTX.clearRect(0, 0, canvasWidth, canvasHeight);
  terrain.draw();

  balls.forEach((b) => b.draw());

  // Draw angles and vertical lines
  for (let index = 0; index < landingData.numPoints; index++) {
    const segmentWidth = canvasWidth / landingData.numPoints;
    const x = index * segmentWidth + segmentWidth / 2;
    const text = `${terrain.getSegmentAngleAtX(x).toFixed(1)}°`;
    const textWidth = CTX.measureText(text).width;

    // Draw vertical bars every other terrain segment
    if (index % 2) {
      const gradient = CTX.createLinearGradient(0, 0, 0, canvasHeight);
      gradient.addColorStop(0, "rgba(255, 255, 255, 0)");
      gradient.addColorStop(0.5, "rgba(255, 255, 255, .1)");
      CTX.fillStyle = gradient;
      CTX.fillRect(
        index * segmentWidth,
        0,
        canvasWidth / landingData.numPoints,
        canvasHeight
      );
    }

    CTX.fillStyle = "white";
    CTX.fillText(text, x - textWidth / 2, landingData.terrainMaxHeight - 100);
    CTX.fillStyle = "rgba(255, 255, 255, 0.25)";
    CTX.fillRect(x, landingData.terrainMaxHeight - 90, 1, canvasHeight);
  }

  // Draw horizontal rule along target height for terrain
  CTX.fillStyle = "rgba(255, 0, 0, 0.75)";
  CTX.fillRect(0, landingData.terrainMaxHeight, canvasWidth, 1);
});
