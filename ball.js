import { randomBetween } from "./helpers.js";

export const makeBall = (CTX, canvasWidth, canvasHeight, landingData) => {
  const size = 20;
  const gravity = 0.5;
  const position = {
    x: randomBetween(size / 2, canvasWidth - size / 2),
    y: size,
  };
  const velocity = { x: 0, y: 0 };

  const update = () => {
    velocity.y += gravity;
    position.x += velocity.x;
    position.y += velocity.y;
  };

  const draw = () => {
    update();
    CTX.fillStyle = "red";
    CTX.arc(position.x, position.y, size, 0, 2 * Math.PI);
    CTX.fill();
  };

  return { draw };
};
