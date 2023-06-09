import { angleReflect, randomBetween } from "./helpers.js";

const progress = (start, end, current) => (current - start) / (end - start);

const transition = (start, end, progress) => start + (end - start) * progress;

const countSimilarCoordinates = (arr) =>
  arr.length -
  new Set(arr.map(({ x, y }) => `${Math.round(x)}|${Math.round(y)}`)).size;

export const makeBall = (
  CTX,
  canvasWidth,
  scaleFactor,
  landingData,
  getSegmentAngleAtX
) => {
  const maxSize = 30;
  const minSize = 7;
  const width = randomBetween(minSize, maxSize);
  const height = randomBetween(minSize, maxSize);
  const gravity = 0.05;
  const friction = transition(
    0.01,
    0.7,
    progress(maxSize * maxSize, minSize * minSize, width * height)
  );
  const velocityThreshold = 2;
  const position = {
    x: randomBetween(width / 2, canvasWidth - width / 2),
    y: height,
  };
  const initialXVelocity = randomBetween(-10, 10);
  const velocity = { x: 0, y: randomBetween(-10, 4) };
  let headingDeg = 90;
  let rotation = 0;
  let stopped = false;
  let positionLog = [];

  let cornersForDebugging = [];
  const isShapeInPath = (path, topLeftX, topLeftY, width, height) => {
    const radius = Math.sqrt(width ** 2 + height ** 2) / 3;
    const numCollisionPoints = 5;
    const dots = new Array(numCollisionPoints).fill().map((_, i) => {
      const angle = (360 / numCollisionPoints) * i;
      return {
        x: topLeftX + radius * Math.cos((angle * Math.PI) / 180),
        y: topLeftY + radius * Math.sin((angle * Math.PI) / 180),
      };
    });

    cornersForDebugging = dots;

    return dots.find(({ x, y }) =>
      CTX.isPointInPath(path, x * scaleFactor, y * scaleFactor)
    );
  };

  const update = () => {
    velocity.x = initialXVelocity + Math.cos((headingDeg * Math.PI) / 180);
    velocity.y += gravity;
    rotation += velocity.x * friction;

    let prospectiveNextPosition = {
      x: position.x + velocity.x,
      y: position.y + velocity.y,
    };

    if (prospectiveNextPosition.y >= landingData.terrainMaxHeight) {
      const collisionPoint = isShapeInPath(
        landingData.terrainPath2D,
        prospectiveNextPosition.x,
        prospectiveNextPosition.y,
        width,
        height
      );

      if (collisionPoint) {
        const collisionAngle = getSegmentAngleAtX(collisionPoint.x);
        headingDeg = angleReflect(headingDeg, collisionAngle);
        velocity.x =
          velocity.x < velocityThreshold ? 0 : velocity.x * -friction;
        velocity.y =
          velocity.y < velocityThreshold ? 0 : velocity.y * -friction;
        rotation = collisionAngle;

        if (countSimilarCoordinates(positionLog) > 3) stopped = true;

        prospectiveNextPosition = {
          x: position.x + velocity.x,
          y: position.y + velocity.y,
        };
      }

      // Track the last 20 positions to check for duplicates
      positionLog.push({ ...position });
      if (positionLog.length > 20) positionLog.shift();
    } else {
      positionLog = [];
    }

    position.x =
      position.x > canvasWidth
        ? 0
        : position.x < 0
        ? canvasWidth
        : prospectiveNextPosition.x;
    position.y = prospectiveNextPosition.y;
  };

  const draw = () => {
    if (!stopped) update();
    CTX.save();

    CTX.fillStyle = "red";
    cornersForDebugging.forEach(({ x, y }) =>
      CTX.fillRect(x - 1.5, y - 1.5, 3, 3)
    );
    CTX.fillStyle = "green";
    positionLog.forEach(({ x, y }) => {
      CTX.fillRect(x - 1.5, y - 1.5, 3, 3);
    });

    CTX.fillStyle = "blue";
    CTX.translate(position.x, position.y);
    CTX.rotate(rotation * (Math.PI / 180));
    CTX.fillRect(-width / 2, -height / 2, width, height);
    CTX.restore();
  };

  return { draw };
};
