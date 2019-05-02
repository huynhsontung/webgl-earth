/// <reference path="./Common/MV.js" />
/// <reference path="./main.js" />
//@ts-check

/**
 * @param {DataContainer} dataSource
 * @param {string} attribName
 */
function setBufferAndAttrib(dataSource, attribName){
    let newBuffer = dataSource.buffer;
    if(!newBuffer){
        newBuffer = gl.createBuffer();
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, newBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, dataSource.rawData, gl.STATIC_DRAW);
    let attrib = gl.getAttribLocation(program, attribName);
    gl.vertexAttribPointer(attrib, dataSource.numOfComponents, dataSource.dataType, dataSource.normalization, 0, 0);
    gl.enableVertexAttribArray(attrib);
    dataSource.buffer = newBuffer;
}

/**
 * @param {number[]} indexArray
 */
function setIndexBuffer(indexArray){
    let indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(decrementFaceIndicies(indexArray)), gl.STATIC_DRAW);
}

/**
 * [red, green, blue, alpha]
 * @param {number[]} colorData
 */
function setColorUniform(colorData){
    var uniform = gl.getUniformLocation(program, "u_color");
    gl.uniform4f(uniform, colorData[0], colorData[1], colorData[2], colorData[3]);
}

class DataContainer {
    constructor() {
        this.rawData = new Float32Array([]);
        this.numOfComponents = 3;
        this.dataType = gl.FLOAT;
        this.normalization = false;
        this.buffer = undefined;
    }
}

function rgbNormalize(r,g,b){
    return [r/255, g/255, b/255, 1];
}

/**
 * Array of 9 values from a face
 * @param {number[]} face
 */
function calculateFaceNormal(face){
    let x = vec3(face[0],face[1],face[2]);
    let y = vec3(face[3],face[4],face[5]);
    let z = vec3(face[6],face[7],face[8]);
    let xy = subtract(y, x);
    let xz = subtract(z, x);
    let result = normalize(cross(xy, xz));
    return result.concat(result, result);
}

/**
 * @param {number[]} vertices
 */
function generateFaceNormalArray(vertices){
    let face = [];
    let normal = [];
    vertices.forEach((value, index) => {
        face.push(value);
        if ( (index+1) % 9 === 0 ){
            let result = calculateFaceNormal(face);
            result = normalize(result);
            normal = normal.concat(result, result, result);
            face = [];
        }
    });
    return normal;
}

/**
 * @param {number[]} faceArray
 */
function decrementFaceIndicies(faceArray){
    let newArray = [];
    faceArray.forEach((value) => {
        newArray.push(value - 1);
    });
    return newArray;
}

function createRenderToTextureFBO(activeTexture){
    let targetTextureWidth = canvas.clientWidth;
    let targetTextureHeight = canvas.clientHeight;

    gl.activeTexture(activeTexture);
    let renderTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, renderTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, targetTextureWidth, targetTextureHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    let frameBuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, renderTexture, 0);

    return {renderTexture, frameBuffer};

}