const va = vec4(0.0, 0.0, -1.0);
const vb = vec4(0.0, 0.942809, 0.333333);
const vc = vec4(-0.816497, -0.471405, 0.333333);
const vd = vec4(0.816497, -0.471405, 0.333333);

const planetColors = {
  Mercury: vec4(0.7, 0.7, 0.7, 1.0), // Gray
  Venus: vec4(1.0, 0.5, 0.0, 1.0), // Orange
  Earth: vec4(0.0, 0.0, 1.0, 1.0), // Blue
  Mars: vec4(1.0, 0.0, 0.0, 1.0), // Red
  Jupiter: vec4(1.0, 0.7, 0.3, 1.0), // Orange
  Saturn: vec4(1.0, 1.0, 0.0, 1.0), // Yellow
  Uranus: vec4(0.6, 0.8, 1.0, 1.0), // Light Blue
  Neptune: vec4(0.0, 0.0, 0.5, 1.0), // Dark Blue
  Sun: vec4(1.0, 0.9, 0.0, 1.0), // Yellow (for the Sun)
};

const initWebGL = (canvasId) => {
  const canvas = document.getElementById(canvasId);
  const gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) {
    alert("WebGL isn't available");
  }
  return gl;
};

const triangle = (a, b, c, pointsArray, planetInfo, colorArray) => {
  const vertices = [a, b, c];

  const translateMatrix = translate(
    planetInfo.distance * planetInfo.dx,
    planetInfo.distance * planetInfo.dy,
    0
  );
  const scaleMatrix = scalem(
    planetInfo.radius,
    planetInfo.radius,
    planetInfo.radius
  );

  vertices.forEach((v) => {
    const r = mult(translateMatrix, mult(scaleMatrix, vec4([...v])));
    pointsArray.push(r);
    colorArray.push(planetInfo.color);
  });
};

const divideTriangle = (
  a,
  b,
  c,
  count,
  pointsArray,
  planetInfo,
  colorArray
) => {
  if (count > 0) {
    let ab = mix(a, b, 0.5);
    let ac = mix(a, c, 0.5);
    let bc = mix(b, c, 0.5);

    ab = normalize(ab, true);
    ac = normalize(ac, true);
    bc = normalize(bc, true);

    divideTriangle(a, ab, ac, count - 1, pointsArray, planetInfo, colorArray);
    divideTriangle(ab, b, bc, count - 1, pointsArray, planetInfo, colorArray);
    divideTriangle(bc, c, ac, count - 1, pointsArray, planetInfo, colorArray);
    divideTriangle(ab, bc, ac, count - 1, pointsArray, planetInfo, colorArray);
  } else {
    triangle(a, b, c, pointsArray, planetInfo, colorArray);
  }
};

const tetrahedron = (a, b, c, d, pointsArray, planetInfo, colorArray) => {
  const n = 3;
  divideTriangle(a, b, c, n, pointsArray, planetInfo, colorArray);
  divideTriangle(d, c, b, n, pointsArray, planetInfo, colorArray);
  divideTriangle(a, d, b, n, pointsArray, planetInfo, colorArray);
  divideTriangle(a, c, d, n, pointsArray, planetInfo, colorArray);
};

// r - radius.
// d - planet-sun distance.
// dx - x-displacement in time theta
// dy - y-displacement in time theta

const generateCelestialBody = (r, d, dx, dy, planet) => {
  let pointsArray = [];
  let colorArray = [];

  const planetInfo = {
    radius: r,
    distance: d + r,
    dx: dx,
    dy: dy,
    color: planetColors[planet],
  };

  tetrahedron(va, vb, vc, vd, pointsArray, planetInfo, colorArray);
  return { pointsArray, colorArray };
};
