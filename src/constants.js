var va = vec4(0.0, 0.0, -1.0, 1);
var vb = vec4(0.0, 0.942809, 0.333333, 1);
var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
var vd = vec4(0.816497, -0.471405, 0.333333, 1);

const colors = [
  vec4(1.0, 0.0, 0.0, 1.0), // Red
  vec4(0.0, 1.0, 0.0, 1.0), // Green
  vec4(0.0, 0.0, 1.0, 1.0), // Blue
];

const initWebGL = (canvasId) => {
  let canvas = document.getElementById(canvasId);
  let gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) {
    alert("WebGL isn't available");
  }
  return gl;
};

const generateRandColors = () => {
  return vec4(Math.random(), Math.random(), Math.random(), 1);
};
