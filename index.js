import {
  animate,
  generateCanvas,
  randomBetween,
  getLineAngle,
  shuffleArray,
} from "./helpers.js";

const [CTX, canvasWidth, canvasHeight, canvasElement, scaleFactor] =
  generateCanvas({
    width: window.innerWidth,
    height: window.innerHeight,
    attachNode: "#game",
  });

export const makeTerrain = () => {
  const targetHeight = canvasHeight * 0.85;
  const landingMaxHeight = canvasHeight * 0.82;
  const landingMinHeight = canvasHeight * 0.88;
  const numPoints = 6; //Math.round(canvasWidth / 40);
  let landingZoneSpans = [];
  let landingSurfaces = [];
  let terrainPathArray = [];
  let terrainPath2D;

  // Divide the canvas into three spans with some margin between the spans
  // and between the spans and the edge of the canvas. This array will be
  // `pop()`d by `generateLandingSurface()`, so it's shuffled to prevent the
  // large surface from always being in one region of the screen.
  const generateLandingZoneSpans = () => {
    landingZoneSpans = [
      { minPoint: 1, maxPoint: Math.floor(numPoints / 3) },
      {
        minPoint: Math.floor(numPoints / 3) + 1,
        maxPoint: Math.floor((numPoints / 3) * 2),
      },
      {
        minPoint: Math.floor((numPoints / 3) * 2) + 1,
        maxPoint: numPoints - 1,
      },
    ];

    shuffleArray(landingZoneSpans);
  };

  const generateLandingSurface = (widthUnit) => {
    // Determine how many points are needed to at least be as wide as the
    // lander, and then use that as a basis for the passed width unit
    const minWidthInPoints = Math.ceil(50 / (canvasWidth / numPoints));
    const landingZone = landingZoneSpans.pop();
    const landingZoneWidth = landingZone.maxPoint - landingZone.minPoint;

    // Ensure the surface is no wider than the zone
    const widthInPoints = Math.min(
      minWidthInPoints * widthUnit,
      landingZoneWidth
    );

    // Only create an offset startPoint if there's enough width to render
    // the widthInPoints
    const startPoint =
      widthInPoints === landingZoneWidth
        ? landingZone.minPoint
        : Math.floor(
            randomBetween(
              landingZone.minPoint,
              landingZone.maxPoint - widthInPoints
            )
          );

    return {
      startPoint,
      widthInPoints,
      height: randomBetween(landingMinHeight, landingMaxHeight),
    };
  };

  const generateTerrainY = (width, height, displace, roughness) => {
    let points = [];
    let power = Math.pow(2, Math.ceil(Math.log(width) / Math.log(2)));

    points[0] = height + Math.random() * displace * 2 - displace;
    points[power] = height + Math.random() * displace * 2 - displace;

    displace *= roughness;

    for (let i = 1; i < power; i *= 2) {
      for (let j = power / i / 2; j < power; j += power / i) {
        points[j] = (points[j - power / i / 2] + points[j + power / i / 2]) / 2;
        points[j] += Math.random() * displace * 2 - displace;
      }

      displace *= roughness;
    }

    return points;
  };

  const reGenerate = () => {
    generateLandingZoneSpans();
    landingSurfaces = [generateLandingSurface(4), generateLandingSurface(1)];
    terrainPathArray = generateTerrainY(numPoints, targetHeight, 100, 0.5).map(
      (y, index) => {
        // Get landing surface if we've reached its x position
        const landingSurface = landingSurfaces.find(
          (surface) =>
            index >= surface.startPoint &&
            index <= surface.startPoint + surface.widthInPoints
        );

        const x = index * (canvasWidth / numPoints);
        const newY = landingSurface ? landingSurface.height : y;

        return { x, y: newY };
      }
    );

    const terrainPath = new Path2D();
    terrainPath.moveTo(0, canvasHeight);
    terrainPathArray.forEach(({ x, y }) => terrainPath.lineTo(x, y));
    terrainPath.lineTo(canvasWidth, canvasHeight);
    terrainPath.closePath();

    terrainPath2D = terrainPath;
  };

  reGenerate();

  const draw = () => {
    CTX.save();
    CTX.fillStyle = "gray";
    CTX.fill(terrainPath2D);
    CTX.restore();

    // Highlight landing zones in white
    landingSurfaces.forEach((surfaces) => {
      CTX.save();
      CTX.lineWidth = 2;
      CTX.strokeStyle = "white";
      CTX.beginPath();
      CTX.moveTo(
        surfaces.startPoint * (canvasWidth / numPoints),
        surfaces.height
      );
      CTX.lineTo(
        surfaces.startPoint * (canvasWidth / numPoints) +
          surfaces.widthInPoints * (canvasWidth / numPoints),
        surfaces.height
      );
      CTX.closePath();
      CTX.stroke();
      CTX.restore();
    });
  };

  const getLandingData = () => {
    let landingSurfacesInPixels = [];

    landingSurfaces.forEach(({ startPoint, widthInPoints }) => {
      landingSurfacesInPixels.push({
        x: startPoint * (canvasWidth / numPoints),
        width: widthInPoints * (canvasWidth / numPoints),
      });
    });

    return {
      terrainPath2D,
      numPoints,
      terrainHeight: targetHeight,
      landingSurfaces: landingSurfacesInPixels,
    };
  };

  const getSegmentAngleAtX = (x) => {
    const segmentNumber = Math.floor(
      x / (canvasWidth / terrainPathArray.length)
    );
    const segmentStart = terrainPathArray[segmentNumber];
    const segmentEnd = terrainPathArray[segmentNumber + 1];
    return getLineAngle(segmentStart, segmentEnd);
  };

  return { draw, reGenerate, getLandingData, getSegmentAngleAtX };
};

const terrain = makeTerrain();
const landingData = terrain.getLandingData();

animate(() => {
  CTX.clearRect(0, 0, canvasWidth, canvasHeight);
  terrain.draw();

  for (let index = 0; index < landingData.numPoints; index++) {
    const segmentWidth = Math.floor(canvasWidth / landingData.numPoints);
    const x = index * segmentWidth + segmentWidth / 2;
    const text = terrain.getSegmentAngleAtX(x).toFixed(1);

    CTX.fillStyle = "white";
    CTX.fillText(text, x, 12);
    CTX.fillStyle = "rgba(255, 255, 255, 0.5)";
    CTX.fillRect(x + CTX.measureText(text).width / 2, 16, 1, canvasHeight);
  }
});
