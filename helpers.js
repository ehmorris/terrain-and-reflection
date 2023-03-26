export const generateCanvas = ({ width, height, attachNode }) => {
  const element = document.createElement("canvas");
  const context = element.getContext("2d");

  element.style.width = width + "px";
  element.style.height = height + "px";

  const scale = window.devicePixelRatio;
  element.width = Math.floor(width * scale);
  element.height = Math.floor(height * scale);
  context.scale(scale, scale);

  document.querySelector(attachNode).appendChild(element);

  return [context, width, height, scale];
};

export const animate = (drawFunc) => {
  let startTime = Date.now();
  let currentFrameTime = Date.now();

  const resetStartTime = () => (startTime = Date.now());

  const drawFuncContainer = () => {
    currentFrameTime = Date.now();
    drawFunc(currentFrameTime - startTime);
    window.requestAnimationFrame(drawFuncContainer);
  };

  window.requestAnimationFrame(drawFuncContainer);

  return { resetStartTime };
};

export const getLineAngle = (startCoordinate, endCoordinate) => {
  const dy = endCoordinate.y - startCoordinate.y;
  const dx = endCoordinate.x - startCoordinate.x;
  let theta = Math.atan2(dy, dx);
  theta *= 180 / Math.PI;
  return theta;
};

export const angleReflect = (incidenceAngle, surfaceAngle) => {
  const a = surfaceAngle * 2 - incidenceAngle;
  return a >= 360 ? a - 360 : a < 0 ? a + 360 : a;
};

export const randomBetween = (min, max) => Math.random() * (max - min) + min;

export const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
};
