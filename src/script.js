let pointsArray = [];

let time = 0;
let dtime = 0.04;

let far = 1000;
let near = 50;

let vBuffer;

let V, P, N;
let modelViewMatrixLoc, projectionMatrixLoc;

let eye;
let at = vec3(0.0, 0.0, 0.0);
let up = vec3(0.0, 1.0, 0.0);
let animationRequestId;

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

  gl.cullFace(gl.BACK);

  modelViewMatrixLoc = gl.getUniformLocation(program, "u_modelViewMatrix");
  projectionMatrixLoc = gl.getUniformLocation(program, "u_projectionMatrix");

  eye = vec3(near, near, near);
  V = lookAt(eye, at, up);
  P = perspective(45, 1, near, far);
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(V));
  gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(P));

  renderScene();
};

const renderScene = () => {
  time += dtime; //increment a unit of time

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  //Insert logic for calculating the position of a planet after time chunk 'time'

  let dx = 1.0;
  let dy = 1.0;

  let sun = generateCelestialBody(3.0, 0.0, 0.0, 0.0); // sun is still so we dont need a position change with time

  let planet = generateCelestialBody(1.0, 8.0, dx, dy); // this is a test planet to make sure the orbital logic is correct

  pointsArray = [...sun, ...planet]; // add all bodies to the array

  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

  for (let i = 0; i < pointsArray.length; i += 3) {
    gl.drawArrays(gl.TRIANGLES, i, 3);
  }
  animationRequestId = requestAnimationFrame(renderScene);
};
