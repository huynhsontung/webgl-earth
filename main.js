/// <reference path="./Common/MV.js" />
/// <reference path="./Common/webgl-utils.js" />
/// <reference path="./Common/initShaders.js" />
/// <reference path="./controls.js" />
/// <reference path="./helpers.js" />
/// <reference path="./light.js" />
/// <reference path="./sphereObj.js" />


//@ts-check

var viewMatrix, projectionMatrix, modelViewMatrix, modelMatrix;
var geoData, normalData, textureData;
var canvas, gl, program, requestAnimation;
var fovy;
var updateProjectionMatrix;
var secondProgram, thirdProgram;
window.onload = function init(){
    canvas = document.getElementById("gl-canvas");
    
    initHandlers();
    // @ts-ignore
    gl = canvas.getContext("webgl");
    gl.clearColor(0,0,0,1.0);
    // gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    secondProgram = initShaders(gl, "vertex-shader1", "fragment-shader1");
    thirdProgram = initShaders(gl, "vertex-shader1", "fragment-shader2");
    gl.useProgram(program);
    
    let eye = [0,0,5];
    let at = [0,0,0];
    let up = [0,1,0];
    
    fovy = 40;
    let aspect = canvas.clientWidth / canvas.clientHeight;
    let near = 0.2;
    let far = 20;
    
    updateProjectionMatrix = () => {
        projectionMatrix = perspective(fovy, aspect, near, far);
        gl.uniformMatrix4fv( gl.getUniformLocation(program, "projectionMatrix"), false, flatten(projectionMatrix) );
    }
    updateProjectionMatrix();
    viewMatrix = lookAt(eye, at , up);
    modelMatrix = mat4();
    initDataContainers();
    // configLight();
    setupEarthGeo();
    setupTexture();
    setupRenderToTexture();
    requestAnimation = window.requestAnimationFrame(render);
};

function render() {
    configLight();
    angle += 0.5 * rotating;
    // generating normal image
    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
    setupEarthGeo();
    gl.clearColor(0,0,0,1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    drawEarth();
    drawLight();

    // generating image with only brightest pixels
    secondRender();

    // final render
    
    if (doneLoading) {
        thirdRender();
    }

    requestAnimationFrame(render);
}

function initDataContainers(){
    geoData = new DataContainer;
    normalData = new DataContainer;
    textureData = new DataContainer;
    geoData1 = new DataContainer;
    textureData1 = new DataContainer;
    geoData2 = new DataContainer;
    textureData2 = new DataContainer;
}

var sphere = new Sphere();

function setupEarthGeo(){
    geoData.rawData = new Float32Array(sphere.vertices);
    normalData.rawData = new Float32Array(sphere.normal);
    textureData.rawData = new Float32Array(sphere.texCoord);
    setBufferAndAttrib(geoData, "a_position");
    setBufferAndAttrib(normalData, "a_normal");
    setBufferAndAttrib(textureData, "a_texcoord");
    setIndexBuffer(sphere.index);
}

var angle = 0;
function drawEarth(){
    if(angle >= 360) angle -= 360;
    let localModelMatrix = mult(modelMatrix, rotate(angle, [0,1,0]) );
    modelViewMatrix = mult(viewMatrix, localModelMatrix);
    gl.uniformMatrix4fv( gl.getUniformLocation(program, "geoModelViewMatrix"), false, flatten(
        mult(modelViewMatrix, rotate(180, [0,0,1]) ) )); // model correction
    gl.uniformMatrix4fv( gl.getUniformLocation(program, "rotationMatrix"), false, flatten(
        mult(localModelMatrix, rotate(180, [0,0,1]) )) );
    gl.uniform1i(gl.getUniformLocation(program, "isShaded"), 1);
    gl.drawElements(gl.TRIANGLES, sphere.index.length, gl.UNSIGNED_SHORT, 0);
}

var doneLoading = false; var texture = [];
function setupTexture(){
    let loadImage = (path) => {
        return new Promise((resolve) => {
            let image = new Image;
            image.onload = () => {resolve(image)};
            image.src = path;
        });
    }

    //tmp texture
    let tmpTexture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tmpTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));
    gl.activeTexture(gl.TEXTURE1);
    tmpTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tmpTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));

    Promise.all([
        loadImage("/MapOfEarth.jpg"),
        loadImage("/EarthAtNight.jpg")
    ]).then((images)=>{
        texture[0] = gl.createTexture();
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture[0]);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,gl.UNSIGNED_BYTE, images[0]);
        gl.generateMipmap(gl.TEXTURE_2D);

        texture[1] = gl.createTexture();
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, texture[1]);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,gl.UNSIGNED_BYTE, images[1]);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.uniform1i(gl.getUniformLocation(program, "u_texture1"), 1);
        doneLoading = true;
    });
}

var frameBuffer, renderTexture, frameBuffer1, renderTexture1, frameBuffer2, renderTexture2;
function setupRenderToTexture(){
    let targetTextureWidth = canvas.clientWidth;
    let targetTextureHeight = canvas.clientHeight;

    let fbo = createRenderToTextureFBO(gl.TEXTURE2);
    renderTexture = fbo.renderTexture;
    frameBuffer = fbo.frameBuffer;
    
    let depthBuffer = gl.createRenderbuffer(); // depth buffer for frameBuffer
    gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, targetTextureWidth, targetTextureHeight);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);


    fbo = createRenderToTextureFBO(gl.TEXTURE3);
    renderTexture1 = fbo.renderTexture;
    frameBuffer1 = fbo.frameBuffer;

    fbo = createRenderToTextureFBO(gl.TEXTURE4);
    renderTexture2 = fbo.renderTexture;
    frameBuffer2 = fbo.frameBuffer; 
}