/// <reference path="./Common/MV.js" />
/// <reference path="./main.js" />
//@ts-check

/*
*   Third render
*   in - raw image in texture2
*   in - image with only brightest pixels in texture3
*   out - final image with post processing
*/
var geoData2, textureData2, horizontal = 1;
function thirdRender(){
    if (horizontal === 1){
        gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer2);
    } else {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
    let programCopy = program;

    program = thirdProgram;  // helpers use variable program not postProgram; such a hassle to refactor it.
    gl.useProgram(thirdProgram);
    geoData2.rawData = new Float32Array([
        -1,-1,0,
        -1,1,0,
        1,1,0,
        -1,-1,0,
        1,1,0,
        1,-1,0
    ]);

    textureData2.rawData = new Float32Array([
        0,0,0,
        0,1,0,
        1,1,0,
        0,0,0,
        1,1,0,
        1,0,0
    ]);

    setBufferAndAttrib(geoData2, "a_position");
    setBufferAndAttrib(textureData2, "a_texcoord");
    if (horizontal === 1){
        gl.activeTexture(gl.TEXTURE3);
        gl.bindTexture(gl.TEXTURE_2D, renderTexture1);
        gl.uniform1i(gl.getUniformLocation(program, "u_texture1"), 3);
    } else {
        gl.activeTexture(gl.TEXTURE4);
        gl.bindTexture(gl.TEXTURE_2D, renderTexture2);
        gl.uniform1i(gl.getUniformLocation(program, "u_texture1"), 4);
    }
    gl.uniform1i(gl.getUniformLocation(program, "u_texture0"), 2);
    gl.uniform1i(gl.getUniformLocation(program, "horizontal"), horizontal);
    gl.uniform2fv(gl.getUniformLocation(program, "textureSize"), [canvas.clientWidth, canvas.clientHeight]);
    let kernel = [
        0.032105, 0.032033, 0.031821, 0.031469, 0.030984, 0.03037, 0.029637, 0.028793, 0.02785,
        0.026818, 0.025709, 0.024538, 0.023315, 0.022056, 0.020772, 0.019476, 0.01818, 0.016895,
        0.015631, 0.014398, 0.013203]; // gaussian blur: sigma = 15, size 41
    // let kernel = [0.056514, 0.056074, 0.054777, 0.052681, 0.049881, 0.046499, 0.042674, 0.038558, 0.0343, 0.030039, 0.0259,
    //     0.021986, 0.018374];
    // let kernel = [0.198596, 0.175713, 0.121703, 0.065984, 0.028002, 0.0093];
    gl.uniform1fv(gl.getUniformLocation(program, "kernel[0]"), kernel );
    gl.clearColor(0,0,0,1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawArrays( gl.TRIANGLES, 0, 6 );
    program = programCopy;
    gl.useProgram(program);

    if (horizontal === 1){
        horizontal = 0;
        thirdRender();
    } else {
        horizontal = 1;
    }
}

/*
*   Second render
*   in - raw image in texture2
*   out - image with only brightest pixels in texture3
*/
var geoData1, textureData1;
function secondRender(){
    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer1);
    gl.clearColor(0,0,0,1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    let programCopy = program;

    program = secondProgram;  // helpers use variable program not postProgram; such a hassle to refactor it.
    gl.useProgram(secondProgram);
    geoData1.rawData = new Float32Array([
        -1,-1,0,
        -1,1,0,
        1,1,0,
        -1,-1,0,
        1,1,0,
        1,-1,0
    ]);

    textureData1.rawData = new Float32Array([
        0,0,0,
        0,1,0,
        1,1,0,
        0,0,0,
        1,1,0,
        1,0,0
    ]);

    setBufferAndAttrib(geoData1, "a_position");
    setBufferAndAttrib(textureData1, "a_texcoord");
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, renderTexture);
    gl.uniform1i(gl.getUniformLocation(program, "u_texture0"), 2);
    gl.clearColor(0,0,0,1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawArrays( gl.TRIANGLES, 0, 6 );
    program = programCopy;
    gl.useProgram(program);
}