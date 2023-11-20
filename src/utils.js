const initWebGL = (canvasId) => {
  let canvas = document.getElementById(canvasId);
  let gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) {
    alert("WebGL isn't available");
  }
  return gl;
};
