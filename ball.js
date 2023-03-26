import { angleReflect, randomBetween } from "./helpers.js";

export const makeBall = (
  CTX,
  canvasWidth,
  scaleFactor,
  landingData,
  getSegmentAngleAtX
) => {
  const size = 20;
  const gravity = 0.05;
  const position = {
    x: randomBetween(size / 2, canvasWidth - size / 2),
    y: size,
  };
  const velocity = { x: 0, y: 0 };
  let headingDeg = 90;

  const isShapeInPath = (path, topLeftX, topLeftY, width, height) => {
    const corners = [
      // Bottom right
      { x: topLeftX + width, y: topLeftY + height },
      // Bottom left
      { x: topLeftX, y: topLeftY + height },
    ];

    // Debugging
    CTX.fillStyle = "red";
    CTX.fillRect(topLeftX + width, topLeftY + height, 2, 2);
    CTX.fillRect(topLeftX, topLeftY + height, 2, 2);

    return corners.find(({ x, y }) =>
      CTX.isPointInPath(path, x * scaleFactor, y * scaleFactor)
    );
  };

  const getNextPosition = () => ({
    x: position.x + velocity.x,
    y: position.y + velocity.y,
  });

  const update = () => {
    velocity.x = Math.cos((headingDeg * Math.PI) / 180);
    velocity.y += gravity;
    let newPosition = getNextPosition();
    const collisionPoint = isShapeInPath(
      landingData.terrainPath2D,
      newPosition.x,
      newPosition.y,
      size,
      size
    );

    if (collisionPoint) {
      headingDeg = angleReflect(
        headingDeg,
        getSegmentAngleAtX(collisionPoint.x)
      );

      velocity.y *= -0.8;

      newPosition = getNextPosition();
    }

    position.x = newPosition.x;
    position.y = newPosition.y;

    if (position.x > canvasWidth) position.x = 0;
    if (position.x < 0) position.x = canvasWidth;
  };

  const draw = () => {
    update();
    CTX.fillStyle = "blue";
    CTX.fillRect(position.x, position.y, size, size);
  };

  return { draw };
};
