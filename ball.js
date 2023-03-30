import { angleReflect, randomBetween } from "./helpers.js";

export const makeBall = (
  CTX,
  canvasWidth,
  scaleFactor,
  landingData,
  getSegmentAngleAtX
) => {
  const maxSize = 30;
  const minSize = 10;
  const width = randomBetween(minSize, maxSize);
  const height = randomBetween(minSize, maxSize);
  const gravity = 0.05;
  const friction = randomBetween(0.3, 0.6);
  const velocityThreshold = 1;
  const frameJitterThreshold = 6;
  const position = {
    x: randomBetween(width / 2, canvasWidth - width / 2),
    y: height,
  };
  const initialXVelocity = randomBetween(-10, 10);
  const velocity = { x: 0, y: 0 };
  let headingDeg = 90;
  let rotation = 0;
  let stopped = false;
  let framesInARowCollided = 0;

  let cornersForDebugging;
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

    const prospectiveNextPosition = {
      x: position.x + velocity.x,
      y: position.y + velocity.y,
    };

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
      velocity.x = velocity.x < velocityThreshold ? 0 : velocity.x * -friction;
      velocity.y = velocity.y < velocityThreshold ? 0 : velocity.y * -friction;
      rotation = collisionAngle;
      framesInARowCollided++;

      if (
        framesInARowCollided > frameJitterThreshold ||
        (velocity.x === 0 && velocity.y === 0)
      ) {
        stopped = true;
      } else {
        position.x = position.x + velocity.x;
        position.y = position.y + velocity.y;
      }
    } else {
      position.x = prospectiveNextPosition.x;
      position.y = prospectiveNextPosition.y;
      framesInARowCollided = 0;
    }

    if (position.x > canvasWidth) position.x = 0;
    if (position.x < 0) position.x = canvasWidth;
  };

  const draw = () => {
    if (!stopped) update();
    CTX.save();

    CTX.fillStyle = "red";
    cornersForDebugging.forEach(({ x, y }) =>
      CTX.fillRect(x - 1.5, y - 1.5, 3, 3)
    );

    CTX.fillStyle = "blue";
    CTX.translate(position.x, position.y);
    CTX.rotate(rotation * (Math.PI / 180));
    CTX.fillRect(-width / 2, -height / 2, width, height);
    CTX.restore();
  };

  return { draw };
};
