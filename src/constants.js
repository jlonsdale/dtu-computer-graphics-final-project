const va = vec4(0.0, 0.0, -1.0);
const vb = vec4(0.0, 0.942809, 0.333333);
const vc = vec4(-0.816497, -0.471405, 0.333333);
const vd = vec4(0.816497, -0.471405, 0.333333);

const PLANET_ORDER = [
  "Sun",
  "Mercury",
  "Venus",
  "Earth",
  "Mars",
  "Jupiter",
  "Saturn",
  "Uranus",
  "Neptune",
];

const planetImages = {
  Sun: "../common/2k_sun.jpg",
  Mercury: "../common/2k_mercury.jpg",
  Venus: "../common/2k_venus_surface.jpg",
  Earth: "../common/2k_earth_daymap.jpg",
  Mars: "../common/2k_mars.jpg",
  Jupiter: "../common/2k_jupiter.jpg",
  Saturn: "../common/2k_saturn.jpg",
  Uranus: "../common/2k_uranus.jpg",
  Neptune: "../common/2k_uranus.jpg",
};

const planetType = {
  Mercury: 0, // Gray
  Venus: 1, // Orange
  Earth: 2, // Blue
  Mars: 3, // Red
  Jupiter: 4, // Orange
  Saturn: 5, // Yellow
  Uranus: 6, // Light Blue
  Neptune: 7, // Dark Blue
  Sun: 8, // Yellow (for the Sun)
};

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

const planetaryDistances = {
  Sun: 0.0,
  Mercury: 0.39,
  Venus: 0.72,
  Earth: 1.0,
  Mars: 1.52,
  Jupiter: 5.2,
  Saturn: 9.5,
  Uranus: 19.1,
  Neptune: 30.1,
};

const relativeRadii = {
  Sun: 20.2, // Approximate relative radius of the Sun compared to Earth.
  Mercury: 0.38,
  Venus: 0.95,
  Earth: 1.0,
  Mars: 0.53,
  Jupiter: 11.2,
  Saturn: 9.45,
  Uranus: 4.0,
  Neptune: 3.88,
};

const calculateCumulativeSum = () => {
  let sum = 0;
  //deconstruct object 2 ovid stupid mutable objects javascript fucker
  const radiiCopy = { ...relativeRadii };
  const planets = Object.keys(radiiCopy);

  for (let i = 0; i < planets.length; i++) {
    const planet = planets[i];
    sum += radiiCopy[planet];
    radiiCopy[planet] = sum;
  }

  return radiiCopy;
};

const initWebGL = (canvasId) => {
  const canvas = document.getElementById(canvasId);
  const gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) {
    alert("WebGL isn't available");
  }
  return gl;
};

const triangle = (
  a,
  b,
  c,
  pointsArray,
  normalsArray,
  planetInfo,
  typeArray
) => {
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
    normalsArray.push(vec4(a, b, c, 1.0));
    typeArray.push(planetInfo.type);
  });
};

const divideTriangle = (
  a,
  b,
  c,
  count,
  pointsArray,
  normalsArray,
  planetInfo,
  typeArray
) => {
  if (count > 0) {
    let ab = mix(a, b, 0.5);
    let ac = mix(a, c, 0.5);
    let bc = mix(b, c, 0.5);

    ab = normalize(ab, true);
    ac = normalize(ac, true);
    bc = normalize(bc, true);

    divideTriangle(
      a,
      ab,
      ac,
      count - 1,
      pointsArray,
      normalsArray,
      planetInfo,
      typeArray
    );
    divideTriangle(
      ab,
      b,
      bc,
      count - 1,
      pointsArray,
      normalsArray,
      planetInfo,
      typeArray
    );
    divideTriangle(
      bc,
      c,
      ac,
      count - 1,
      pointsArray,
      normalsArray,
      planetInfo,
      typeArray
    );
    divideTriangle(
      ab,
      bc,
      ac,
      count - 1,
      pointsArray,
      normalsArray,
      planetInfo,
      typeArray
    );
  } else {
    triangle(a, b, c, pointsArray, normalsArray, planetInfo, typeArray);
  }
};

const tetrahedron = (
  a,
  b,
  c,
  d,
  pointsArray,
  normalsArray,
  planetInfo,
  highPerf,
  typeArray
) => {
  const n = highPerf ? 4 : 3;
  divideTriangle(a, b, c, n, pointsArray, normalsArray, planetInfo, typeArray);
  divideTriangle(d, c, b, n, pointsArray, normalsArray, planetInfo, typeArray);
  divideTriangle(a, d, b, n, pointsArray, normalsArray, planetInfo, typeArray);
  divideTriangle(a, c, d, n, pointsArray, normalsArray, planetInfo, typeArray);
};

// r - radius.
// d - planet-sun distance.
// dx - x-displacement in time theta
// dy - y-displacement in time theta

const generateCelestialBody = (r, d, dx, dy, planet, highPerf = false) => {
  let pointsArray = [];
  let normalsArray = [];
  let typeArray = [];

  const planetInfo = {
    radius: r,
    distance: d + r,
    dx: dx,
    dy: dy,
    type: planetType[planet],
  };

  tetrahedron(
    va,
    vb,
    vc,
    vd,
    pointsArray,
    normalsArray,
    planetInfo,
    highPerf,
    typeArray
  );
  return { pointsArray, normalsArray, typeArray };
};
