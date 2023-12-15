let pointsArray = [];
let typeArray = [];

let time = 42; //start an an arbitrary value = looks more real
let dtime = 0.01;

let far = 1200;
let near = 1;

let vBuffer;
let nBuffer;
let iBuffer;

let V, P, N;
let modelViewMatrixLoc, projectionMatrixLoc, textureLocation;

let at = vec3(0.0, 0.0, 0.0);
let up = vec3(0.0, 1.0, 0.0);
let animationRequestId;

let kdcol = vec4(0.8, 0.8, 0.8, 1.0);
let kacol = vec4(0.7, 0.5, 0.2, 1.0);
let kscol = vec4(1.0, 1.0, 1.0, 1.0);

let ka_val = 0.5;
let kd_val = 0.5;
let ks_val = 1;
let li_val = 1.5;
let shininess = 100.0;

let scrollValue = 100;
let minscrollValue = 100;
let maxscrollValue = 1000;

let planetTextures = {};
let planetVertexLength = {};
let program;
let z = 15;

let eye = vec3(0, scrollValue, 15);

let currentPlanet = null;

const createPlanetButtons = async () => {
  const planetButtonsDiv = document.querySelector(".planet-buttons-container");
  let planets = [...PLANET_ORDER];
  planets.forEach((planet) => {
    if (planet != "Sun") {
      let button = document.createElement("button");
      button.textContent = planet;
      button.id = planet;
      button.addEventListener("click", () => {
        currentPlanet = planet;
      });
      planetButtonsDiv.appendChild(button);
    }
  });
};

const handleScroll = (event) => {
  scrollValue = Math.max(
    minscrollValue,
    Math.min(maxscrollValue, scrollValue + (event.deltaY < 0 ? -1.0 : 1.0))
  );
  eye = vec3(0, scrollValue, z);
};
window.addEventListener("wheel", handleScroll);

window.addEventListener("keydown", function (event) {
  if (event.key === "ArrowUp") {
    if (z < 100) {
      z += 1.0;
      eye = vec3(eye[0], eye[1], z);
    }
    event.preventDefault();
  }
  if (event.key === "ArrowDown") {
    if (z > 1) {
      z -= 1.0;
      eye = vec3(eye[0], eye[1], z);
    }
    event.preventDefault();
  }
});

const loadImages = async () => {
  let planets = [...PLANET_ORDER];
  planets.forEach((planet) => {
    let image = document.createElement("img");
    image.src = planetImages[planet];
    image.onload = async () => {
      let texture = gl.createTexture();
      await gl.bindTexture(gl.TEXTURE_2D, texture);
      await gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      await gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        image
      );
      await gl.generateMipmap(gl.TEXTURE_2D);
      await gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      await gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      await gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
      await gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
      planetTextures[planet] = texture;
    };
  });
};

window.onload = main = async () => {
  createPlanetButtons();

  const clearButton = document.getElementById("clear");
  clearButton.addEventListener("click", () => {
    currentPlanet = null;
    scrollValue = 100;
    minscrollValue = 100;
    maxscrollValue = 1000;
    eye = vec3(0, scrollValue, z);
  });

  gl = initWebGL("c");
  gl.clearColor(0.1, 0.0, 0.36, 1.0);
  gl.enable(gl.DEPTH_TEST);

  program = initShaders(gl, "vertex-shader", "fragment-shader");
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

  gl.cullFace(gl.BACK);

  modelViewMatrixLoc = gl.getUniformLocation(program, "u_modelViewMatrix");
  projectionMatrixLoc = gl.getUniformLocation(program, "u_projectionMatrix");
  textureLocation = gl.getUniformLocation(program, "texture");

  gl.uniform4fv(gl.getUniformLocation(program, "ksColor"), flatten(kscol));
  gl.uniform4fv(gl.getUniformLocation(program, "kaColor"), flatten(kacol));
  gl.uniform4fv(gl.getUniformLocation(program, "kdColor"), flatten(kdcol));

  gl.uniform1f(gl.getUniformLocation(program, "kd"), kd_val);
  gl.uniform1f(gl.getUniformLocation(program, "ks"), ka_val);
  gl.uniform1f(gl.getUniformLocation(program, "ks"), ks_val);
  gl.uniform1f(gl.getUniformLocation(program, "li"), li_val);
  gl.uniform1f(gl.getUniformLocation(program, "shine"), shininess);

  await loadImages();

  renderScene();
};

const renderScene = async () => {
  time += 0.01;

  gl.uniform1f(gl.getUniformLocation(program, "time"), time);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  at = vec3(0.0, 0.0, 0.0);
  up = vec3(0.0, 1.0, 0.0);
  V = lookAt(eye, at, up);
  P = perspective(-100, 1, near, scrollValue + far);

  let planetPoints = {};
  let planetNormals = {};
  let planets = [...PLANET_ORDER];

  planets.forEach((planet) => {
    let dx = Math.cos(time * relativeOrbitalSpeeds[planet]);
    let dy = Math.sin(time * relativeOrbitalSpeeds[planet]);

    const distance = planetaryDistances[planet];
    const radius = relativeRadii[planet];
    let { pointsArray: points, normalsArray: normal } = generateCelestialBody(
      radius,
      distance == 0 ? 0 : 50 + distance * 10,
      distance == 0 ? 0 : dx,
      distance == 0 ? 0 : dy,
      planet,
      planet == currentPlanet || planet == "Sun"
    );
    if (planet == currentPlanet) {
      minscrollValue = distance + radius * 2;
      maxscrollValue = distance + radius * 10;

      if (scrollValue < minscrollValue) {
        scrollValue = minscrollValue + 1;
      }
      if (scrollValue > maxscrollValue) {
        scrollValue = minscrollValue + 1;
      }
      at = vec3(points[0][0], points[0][1], points[0][2]);
      eye = vec3(
        points[0][0] + 2 * radius,
        points[0][1] + 2 * radius,
        scrollValue
      );
      V = lookAt(eye, at, up);
      P = perspective(100, 1, distance + near, distance + far + scrollValue);
    } else {
      V = lookAt(eye, at, up);
      P = perspective(-100, 1, near, scrollValue + far);
    }
    planetPoints[planet] = [...points];
    planetNormals[planet] = [...normal];
  });

  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(V));
  gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(P));
  
  gl.uniform1f(gl.getUniformLocation(program, "isSkybox"), false);

  planets.forEach((planetName) => {
    if (planetName == "Sun") {
      gl.uniform1f(gl.getUniformLocation(program, "isSun"), true);
    } else {
      gl.uniform1f(gl.getUniformLocation(program, "isSun"), false);
    }
    if (planetName == "Earth") {
      gl.uniform1f(gl.getUniformLocation(program, "isEarth"), true);
    } else {
      gl.uniform1f(gl.getUniformLocation(program, "isEarth"), false);
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      flatten(planetPoints[planetName]),
      gl.STATIC_DRAW
    );
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      flatten(planetNormals[planetName]),
      gl.STATIC_DRAW
    );
    gl.bindTexture(gl.TEXTURE_2D, planetTextures[planetName]);
    gl.uniform1i(textureLocation, 0);
    gl.drawArrays(gl.TRIANGLES, 0, planetPoints[planetName].length);
  });

  gl.uniform1f(gl.getUniformLocation(program, "isSkybox"), true);

  let skybox = drawCube(vec3(-600.0,-800.0,-600.0),3000,3000,3000);
  let skybox_vertices = skybox[0];
  let skybox_texture = skybox[1];

  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER,flatten(skybox_vertices),gl.STATIC_DRAW);

  gl.bindTexture(gl.TEXTURE_2D, planetTextures["Sky"]);
  gl.uniform1i(textureLocation, 0);

  gl.drawArrays(gl.TRIANGLES, 0, skybox_vertices.length);

  gl.uniform1f(gl.getUniformLocation(program, "isSkybox"), false);


  animationRequestId = requestAnimationFrame(renderScene);
};
