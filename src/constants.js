const va = vec4(0.0, 0.0, -1.0);
const vb = vec4(0.0, 0.942809, 0.333333);
const vc = vec4(-0.816497, -0.471405, 0.333333);
const vd = vec4(0.816497, -0.471405, 0.333333);

const initWebGL = (canvasId) => {
  const canvas = document.getElementById(canvasId);
  const gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) {
    alert("WebGL isn't available");
  }
  return gl;
};

const triangle = (a, b, c, pointsArray, planetInfo) => {
  const vertices = [a, b, c];

  const translateMatrix = translate(
    planetInfo.distance + planetInfo.dx,
    planetInfo.distance + planetInfo.dy,
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
  });
};

const divideTriangle = (a, b, c, count, pointsArray, planetInfo) => {
  if (count > 0) {
    let ab = mix(a, b, 0.5);
    let ac = mix(a, c, 0.5);
    let bc = mix(b, c, 0.5);

    ab = normalize(ab, true);
    ac = normalize(ac, true);
    bc = normalize(bc, true);

    divideTriangle(a, ab, ac, count - 1, pointsArray, planetInfo);
    divideTriangle(ab, b, bc, count - 1, pointsArray, planetInfo);
    divideTriangle(bc, c, ac, count - 1, pointsArray, planetInfo);
    divideTriangle(ab, bc, ac, count - 1, pointsArray, planetInfo);
  } else {
    triangle(a, b, c, pointsArray, planetInfo);
  }
};

const tetrahedron = (a, b, c, d, pointsArray, planetInfo) => {
  const n = 4;
  divideTriangle(a, b, c, n, pointsArray, planetInfo);
  divideTriangle(d, c, b, n, pointsArray, planetInfo);
  divideTriangle(a, d, b, n, pointsArray, planetInfo);
  divideTriangle(a, c, d, n, pointsArray, planetInfo);
};

// r - radius.
// d - planet-sun distance.
// dx - x-displacement in time theta
// dy - y-displacement in time theta

const generateCelestialBody = (r, d, dx, dy) => {
  let pointsArray = [];

  const planetInfo = {
    radius: r,
    distance: d,
    dx: dx,
    dy: dy,
  };

  tetrahedron(va, vb, vc, vd, pointsArray, planetInfo);
  return pointsArray;
};
