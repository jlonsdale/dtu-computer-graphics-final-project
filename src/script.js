let pointsArray = [];
let colorArray = [];

let time = 0;
let dtime = 0.04;

let far = 100;
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

let kscol = vec4(1.0,1.0,1.0,1.0);
let kdcol = vec4(1.0,0.0,0.0,1.0);
let kacol = vec4(0.0,0.0,1.0,1.0);

let ka_val = 0.5;
let ks_val = 1;
let kd_val = 0.5;
let li_val = 1.5;
let shininess = 100.0;

let scrollValue = 10;
const minscrollValue = 10;
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

  nBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);

  let vNormal = gl.getAttribLocation(program, "a_Normal");
  gl.vertexAttribPointer(vNormal, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vNormal);

  cBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);

  let vColor = gl.getAttribLocation(program, "a_Color");
  gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vColor);

  gl.cullFace(gl.BACK);

  modelViewMatrixLoc = gl.getUniformLocation(program, "u_modelViewMatrix");
  projectionMatrixLoc = gl.getUniformLocation(program, "u_projectionMatrix");
 
  
  gl.uniform4fv(gl.getUniformLocation(program, "ksColor"),flatten(kscol));
  gl.uniform4fv(gl.getUniformLocation(program, "kaColor"),flatten(kacol));
  gl.uniform4fv(gl.getUniformLocation(program, "kdColor"),flatten(kdcol));

  gl.uniform1f(gl.getUniformLocation(program, "kd"),kd_val);
  gl.uniform1f(gl.getUniformLocation(program, "ks"),ka_val);
  gl.uniform1f(gl.getUniformLocation(program, "ks"),ks_val);
  gl.uniform1f(gl.getUniformLocation(program, "li"),li_val);
  gl.uniform1f(gl.getUniformLocation(program, "shine"), shininess);

  renderScene();
};

const renderScene = () => {
  time += dtime; //increment a unit of time

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  eye = vec3(0, scrollValue, 30);
  V = lookAt(eye, at, up);
  P = perspective(-90, 1, near, scrollValue + far);
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(V));
  gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(P));

  let dx = Math.cos(time);
  let dy = Math.sin(time);

  let { pointsArray: sun, normalsArray: sun,  colorArray: sunColor } = generateCelestialBody(
    5.0,
    0.0,
    0.0,
    0.0,
    "Sun"
  );
  let { pointsArray: mercury, normalsArray: mercury, colorArray: mercuryColor } =
    generateCelestialBody(1.0, 8.0, dx, dy, "Mercury");

  let { pointsArray: venus, normalsArray: venus,  colorArray: venusColor } = generateCelestialBody(
    2.0,
    20.0,
    dx,
    dy,
    "Venus"
  );

  let { pointsArray: earth, normalsArray: earth, colorArray: earthColor } = generateCelestialBody(
    4.0,
    40.0,
    dx,
    dy,
    "Earth"
  );

  let { pointsArray: mars, normalsArray: mars, colorArray: marsColor } = generateCelestialBody(
    4.0,
    70.0,
    dx,
    dy,
    "Mars"
  );

  pointsArray = [...sun, ...mercury, ...venus, ...earth, ...mars]; // add all bodies to the array
  normalsArray = [...sun, ...mercury, ...venus, ...earth, ...mars]; // add all bodies to normal array
  colorArray = [
    ...sunColor,
    ...mercuryColor,
    ...venusColor,
    ...earthColor,
    ...marsColor,
  ]; // add all bodies to the array

  gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(colorArray), gl.STATIC_DRAW);

  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

  gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);


  for (let i = 0; i < pointsArray.length; i += 3) {
    gl.drawArrays(gl.TRIANGLES, i, 3);
  }

  animationRequestId = requestAnimationFrame(renderScene);
};
