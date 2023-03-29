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
  const friction = randomBetween(0.5, 0.75);
  const velocityThreshold = 0.9;
  const position = {
    x: randomBetween(size / 2, canvasWidth - size / 2),
    y: size,
  };
  const velocity = { x: 0, y: 0 };
  let headingDeg = 90;
  let rotation = 0;
  let stopped = false;

  const rotatePointAroundOrigin = (point, origin, angle) => {
    const angleInRadians = (angle * Math.PI) / 180;
    const rotatedX =
      Math.cos(angleInRadians) * (point.x - origin.x) -
      Math.sin(angleInRadians) * (point.y - origin.y) +
      origin.x;
    const rotatedY =
      Math.sin(angleInRadians) * (point.x - origin.x) +
      Math.cos(angleInRadians) * (point.y - origin.y) +
      origin.y;

    return { x: rotatedX, y: rotatedY };
  };

  const isShapeInPath = (path, topLeftX, topLeftY, width, height) => {
    const corners = [
      // Bottom right
      { x: topLeftX + width - size / 2, y: topLeftY + height - size / 2 },
      // Bottom center
      { x: topLeftX + width / 2 - size / 2, y: topLeftY + height - size / 2 },
      // Bottom left
      { x: topLeftX - size / 2, y: topLeftY + height - size / 2 },
      // Top left
      { x: topLeftX - size / 2, y: topLeftY - size / 2 },
      // Top center
      { x: topLeftX + width / 2 - size / 2, y: topLeftY - size / 2 },
      // Top right
      { x: topLeftX + width - size / 2, y: topLeftY - size / 2 },
      // Left center
      { x: topLeftX - size / 2, y: topLeftY + height / 2 - size / 2 },
      // Right center
      { x: topLeftX + width - size / 2, y: topLeftY + height / 2 - size / 2 },
    ];

    const rotatedCorners = corners.map((corner) =>
      rotatePointAroundOrigin(corner, position, rotation)
    );

    // Debugging
    CTX.fillStyle = "red";
    rotatedCorners.forEach(({ x, y }) => CTX.fillRect(x - 1.5, y - 1.5, 3, 3));

    return rotatedCorners.find(({ x, y }) =>
      CTX.isPointInPath(path, x * scaleFactor, y * scaleFactor)
    );
  };

  const update = () => {
    velocity.x = Math.cos((headingDeg * Math.PI) / 180);
    velocity.y += gravity;

    const prospectiveNextPosition = {
      x: position.x + velocity.x,
      y: position.y + velocity.y,
    };

    const collisionPoint = isShapeInPath(
      landingData.terrainPath2D,
      prospectiveNextPosition.x,
      prospectiveNextPosition.y,
      size,
      size
    );

    if (collisionPoint) {
      headingDeg = angleReflect(
        headingDeg,
        getSegmentAngleAtX(collisionPoint.x)
      );
      velocity.x = velocity.x < velocityThreshold ? 0 : velocity.x * -friction;
      velocity.y = velocity.y < velocityThreshold ? 0 : velocity.y * -friction;
      rotation = getSegmentAngleAtX(collisionPoint.x);

      if (velocity.x === 0 && velocity.y === 0) stopped = true;

      position.x = position.x + velocity.x;
      position.y = position.y + velocity.y;
    } else {
      position.x = prospectiveNextPosition.x;
      position.y = prospectiveNextPosition.y;
    }

    rotation += velocity.x * friction;
    if (position.x > canvasWidth) position.x = 0;
    if (position.x < 0) position.x = canvasWidth;
  };

  const draw = () => {
    if (!stopped) update();
    CTX.save();
    CTX.fillStyle = "blue";
    CTX.translate(position.x, position.y);
    CTX.rotate(rotation * (Math.PI / 180));
    CTX.fillRect(-size / 2, -size / 2, size, size);
    CTX.restore();
  };

  return { draw };
};
