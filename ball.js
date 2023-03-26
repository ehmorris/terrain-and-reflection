import { randomBetween } from "./helpers.js";

export const makeBall = (CTX, canvasWidth, scaleFactor, landingData) => {
  const size = 20;
  const gravity = 0.05;
  const position = {
    x: randomBetween(size / 2, canvasWidth - size / 2),
    y: size,
  };
  const velocity = { x: 0, y: 0 };

  const isShapeInPath = (path, topLeftX, topLeftY, width, height) => {
    const corners = [
      // Top left
      { x: topLeftX, y: topLeftY },
      // Top right
      { x: topLeftX + width, y: topLeftY },
      // Bottom right
      { x: topLeftX + width, y: topLeftY + height },
      // Bottom left
      { x: topLeftX, y: topLeftY + height },
    ];

    // Debugging
    CTX.fillStyle = "red";
    CTX.fillRect(topLeftX, topLeftY, 2, 2);
    CTX.fillRect(topLeftX + width, topLeftY, 2, 2);
    CTX.fillRect(topLeftX + width, topLeftY + height, 2, 2);
    CTX.fillRect(topLeftX, topLeftY + height, 2, 2);

    return corners.some(({ x, y }) =>
      CTX.isPointInPath(path, x * scaleFactor, y * scaleFactor)
    );
  };

  const getNextPosition = () => ({
    x: position.x + velocity.x,
    y: position.y + velocity.y,
  });

  const update = () => {
    velocity.y += gravity;
    let newPosition = getNextPosition();

    if (
      isShapeInPath(
        landingData.terrainPath2D,
        newPosition.x,
        newPosition.y,
        size,
        size
      )
    ) {
      velocity.y = -velocity.y / 1.2;
      newPosition = getNextPosition();
    }

    position.x = newPosition.x;
    position.y = newPosition.y;
  };

  const draw = () => {
    update();
    CTX.fillStyle = "blue";
    CTX.fillRect(position.x, position.y, size, size);
  };

  return { draw };
};
