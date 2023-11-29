let pointsArray = [];
let colorArray = [];

let time = 0;
let dtime = 0.01;

let far = 500;
let near = 1;

let vBuffer;
let nBuffer;
let cBuffer;
let vColor;

let V, P, N;
let modelViewMatrixLoc, projectionMatrixLoc;

let eye;
let at = vec3(0.0, 0.0, 0.0);
let up = vec3(0.0, 1.0, 0.0);
let animationRequestId;

let kscol = vec4(1.0, 1.0, 1.0, 1.0);
let kdcol = vec4(0.8, 0.8, 0.8, 1.0);
let kacol = vec4(0.7, 0.5, 0.2, 1.0);

let ka_val = 0.5;
let ks_val = 1;
let kd_val = 0.5;
let li_val = 1.5;
let shininess = 100.0;

let scrollValue = 100;
const minscrollValue = 100;

const maxscrollValue = 1000;

let sun_texture;


const handleScroll = (event) => {
  scrollValue = Math.max(
    minscrollValue,
    Math.min(maxscrollValue, scrollValue + (event.deltaY < 0 ? -1 : 1))
  );
  console.log("Current scrollValue:", scrollValue);
};

const initSunMap = async (gl,program) => {
  // Uploading textures. 

  const sun_image = await document.createElement("img");
  sun_image.crossOrigin = "anonymous";
  sun_image.src = "./common/2k_sun.jpg";

  sun_texture = gl.createTexture();
  await gl.bindTexture(gl.TEXTURE_2D, sun_texture);

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, sun_image);
  gl.generateMipmap(gl.TEXTURE_2D);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.uniform1i(gl.getUniformLocation(program, "sun_texture"), 0);

}

window.addEventListener("wheel", handleScroll);

window.onload = main = async() => {
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

  gl.uniform4fv(gl.getUniformLocation(program, "ksColor"), flatten(kscol));
  gl.uniform4fv(gl.getUniformLocation(program, "kaColor"), flatten(kacol));
  gl.uniform4fv(gl.getUniformLocation(program, "kdColor"), flatten(kdcol));

  gl.uniform1f(gl.getUniformLocation(program, "kd"), kd_val);
  gl.uniform1f(gl.getUniformLocation(program, "ks"), ka_val);
  gl.uniform1f(gl.getUniformLocation(program, "ks"), ks_val);
  gl.uniform1f(gl.getUniformLocation(program, "li"), li_val);
  gl.uniform1f(gl.getUniformLocation(program, "shine"), shininess);

  // get textures
  initSunMap(gl,program);

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
  normalsArray = [];

  const csumRadii = calculateCumulativeSum();

  for (const planet in planetaryDistances) {
    const distance = planetaryDistances[planet];
    const radius = relativeRadii[planet];
    let {
      pointsArray: points,
      colorArray: colors,
      normalsArray: normal,
    } = generateCelestialBody(
      radius,
      distance == 0 ? 0 : 50 + distance * 10,
      distance == 0 ? 0 : dx,
      distance == 0 ? 0 : dy,
      planet
    );

    pointsArray = [...points, ...pointsArray];
    colorArray = [...colors, ...colorArray];
    normalsArray = [...normal, ...normalsArray];
  }

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
