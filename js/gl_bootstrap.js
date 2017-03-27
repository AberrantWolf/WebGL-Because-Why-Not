/** @type {WebGLRenderingContext} */
var gl;

// preload any required assets, and start loading any delayable assets.
function initialize() {

}

function start_gl() {
    let canvas = document.getElementById("glCanvas");

    /**
     * @type {WebGLRenderingContext}
     */
    gl = initWebGL(canvas);

    if (!gl) {
        return;
    }

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

    //setInterval(draw, 15);
}

function draw() {

}

function initWebGL(canvas) {
    gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

    if (!gl) {
        alert('Unable to initialize WebGL.');
    }

    return gl;
}