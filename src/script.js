let pointsArray = [];
let colorArray = [];

let time = 0;
let dtime = 0.01;

let far = 500;
let near = 1;

let vBuffer;
let cBuffer;
let vColor;

let V, P, N;
let modelViewMatrixLoc, projectionMatrixLoc;

let eye;
let at = vec3(0.0, 0.0, 0.0);
let up = vec3(0.0, 1.0, 0.0);
let animationRequestId;

let scrollValue = 100;
const minscrollValue = 100;
const maxscrollValue = 1000;

const handleScroll = (event) => {
  scrollValue = Math.max(
    minscrollValue,
    Math.min(maxscrollValue, scrollValue + (event.deltaY < 0 ? -1 : 1))
  );
  console.log("Current scrollValue:", scrollValue);
};

window.addEventListener("wheel", handleScroll);

window.onload = function main() {
  gl = initWebGL("c");
  gl.clearColor(0.1, 0.0, 0.36, 1.0);
  gl.enable(gl.DEPTH_TEST);

  let program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  vBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);

  let vPosition = gl.getAttribLocation(program, "a_Position");
  gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  cBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);

  let vColor = gl.getAttribLocation(program, "a_Color");
  gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vColor);

  gl.cullFace(gl.BACK);

  modelViewMatrixLoc = gl.getUniformLocation(program, "u_modelViewMatrix");
  projectionMatrixLoc = gl.getUniformLocation(program, "u_projectionMatrix");
  console.log(calculateCumulativeSum(3));
  renderScene();
};

const renderScene = async () => {
  time += dtime; //increment a unit of time

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  eye = vec3(0, scrollValue, 15);
  V = lookAt(eye, at, up);

  P = perspective(-100, 1, near, scrollValue + far);
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(V));
  gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(P));

  let dx = Math.cos(time);
  let dy = Math.sin(time);

  pointsArray = [];
  colorArray = [];

  const csumRadii = calculateCumulativeSum();

  for (const planet in planetaryDistances) {
    const distance = planetaryDistances[planet];
    const radius = relativeRadii[planet];
    let { pointsArray: points, colorArray: colors } = generateCelestialBody(
      radius,
      distance == 0 ? 0 : 50 + distance * 10,
      distance == 0 ? 0 : dx,
      distance == 0 ? 0 : dy,
      planet
    );

    pointsArray = [...points, ...pointsArray];
    colorArray = [...colors, ...colorArray];
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(colorArray), gl.STATIC_DRAW);

  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

  for (let i = 0; i < pointsArray.length; i += 3) {
    gl.drawArrays(gl.TRIANGLES, i, 3);
  }

  animationRequestId = requestAnimationFrame(renderScene);
};
