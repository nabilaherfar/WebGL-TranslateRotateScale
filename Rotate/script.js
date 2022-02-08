"use strict";

function main() {
  // Get A WebGL context
  /** @type {HTMLCanvasElement} */
  var canvas = document.querySelector("#canvas");
  var gl = canvas.getContext("webgl");
  if (!gl) {
    return;
  }

  // setup GLSL program
  var program = webglUtils.createProgramFromScripts(gl, ["vertex-shader-2d", "fragment-shader-2d"]);

  // look up where the vertex data needs to go.
  var positionLocation = gl.getAttribLocation(program, "a_position");

  // lookup uniforms
  var resolutionLocation = gl.getUniformLocation(program, "u_resolution");
  var colorLocation = gl.getUniformLocation(program, "u_color");
  var translationLocation = gl.getUniformLocation(program, "u_translation");
  var rotationLocation = gl.getUniformLocation(program, "u_rotation");

  // Create a buffer to put positions in
  var positionBuffer = gl.createBuffer();

  // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  var translation = [0, 0];
  var rotation = [1,0];
  var color = [Math.random(), Math.random(), Math.random(), 1];

  drawScene();

  // Setup a ui.
  webglLessonsUI.setupSlider("#x", {slide: updatePosition(0), max: gl.canvas.width });
  webglLessonsUI.setupSlider("#y", {slide: updatePosition(1), max: gl.canvas.height});
  webglLessonsUI.setupSlider("#angle", {slide: updateAngle, max:360});

  function updatePosition(index) {
    return function(event, ui) {
      translation[index] = ui.value;
      drawScene();
    };
  }

  function updateAngle(event, ui) {
    var angleInDeg = 360 - ui.value;
    var angleInRad = angleInDeg * Math.PI / 180;
    rotation[0] = Math.cos(angleInRad);
    rotation[1] = Math.sin(angleInRad);
    drawScene();
  }

  // Draw a the scene.
  function drawScene() {
    webglUtils.resizeCanvasToDisplaySize(gl.canvas);

    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Clear the canvas.
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Tell it to use our program (pair of shaders)
    gl.useProgram(program);

    // Turn on the attribute
    gl.enableVertexAttribArray(positionLocation);

    // Bind the position buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Setup an F
    setGeometry(gl);

    // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    var size = 2;          // 2 components per iteration
    var type = gl.FLOAT;   // the data is 32bit floats
    var normalize = false; // don't normalize the data
    var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0;        // start at the beginning of the buffer
    gl.vertexAttribPointer(
        positionLocation, size, type, normalize, stride, offset);

    // set the resolution
    gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);

    // set the color
    gl.uniform4fv(colorLocation, color);

    gl.uniform2fv(translationLocation, translation);
    gl.uniform2fv(rotationLocation, rotation);
    // Draw the rectangle.
    var primitiveType = gl.TRIANGLES;
    var offset = 0;
    var count = 18;
    gl.drawArrays(primitiveType, offset, count);
  }
}

// Fill the buffer with the values that define a rectangle.
function setGeometry(gl, x = 0, y = 0, width = 100, height = 150, thickness = 30) {
  gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
          // left column
          x, y,
          x+thickness, y,
          x, y+height,
          x, y+height,
          x+thickness, y,
          x+thickness, y+height,

          // top row
          x+thickness, y,
          x+width, y,
          x+thickness, y+thickness,
          x+thickness, y+thickness,
          x+width, y,
          x+width, y+thickness,

          // middle row
          x+thickness, y+(1/2*height)-(1/2*thickness),
          x+(2/3*width), y+(1/2*height)-(1/2*thickness),
          x+thickness, y+(1/2*height)+(1/2*thickness),
          x+thickness, y+(1/2*height)+(1/2*thickness),
          x+(2/3*width), y+(1/2*height)-(1/2*thickness),
          x+(2/3*width), y+(1/2*height)+(1/2*thickness)
      ]),
      gl.STATIC_DRAW);
}

main();
