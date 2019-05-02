/// <reference path="./Common/MV.js" />
/// <reference path="./main.js" />
//@ts-check
function configLight(){
    var lightPosition = vec4(10, 3.0, 0, 1.0 );
    var lightAmbient = vec4(0.8, 0.8, 0.8, 1.0 );
    var lightDiffuse = vec4( 1.2, 1.2, 1.2, 1.0 );
    var lightSpecular = vec4( 0.8, 0.8, 0.8, 1.0 );
    
    var materialAmbient = vec4(1,1,1,1); 
    var materialDiffuse = vec4(1,1,1,1); 
    var materialSpecular = vec4(1,1,1,1);
    var materialShininess = 14;
    
    var ambientProduct = mult(lightAmbient, materialAmbient);
    var diffuseProduct = mult(lightDiffuse, materialDiffuse);
    var specularProduct = mult(lightSpecular, materialSpecular);
    gl.uniform4fv(gl.getUniformLocation(program,"ambientProduct"),flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program,"diffuseProduct"),flatten(diffuseProduct) );
    gl.uniform4fv(gl.getUniformLocation(program,"specularProduct"),flatten(specularProduct) );
    gl.uniform4fv(gl.getUniformLocation(program,"lightPosition"),flatten(lightPosition) );
    let lightModelView = mult(viewMatrix, modelMatrix);
    gl.uniformMatrix4fv(gl.getUniformLocation(program,"pLight1ModelViewMatrix"), false, flatten(lightModelView) );
    gl.uniform1f(gl.getUniformLocation(program,"shininess"), materialShininess);
}

function drawLight(){
    let localModelMatrix = mult(modelMatrix, translate(10,3,0));
    localModelMatrix = mult(localModelMatrix, scalem(0.2, 0.2, 0.2));
    modelViewMatrix = mult(viewMatrix, localModelMatrix);
    gl.uniformMatrix4fv( gl.getUniformLocation(program, "geoModelViewMatrix"), false, flatten(modelViewMatrix )); // model correction
    gl.uniformMatrix4fv( gl.getUniformLocation(program, "rotationMatrix"), false, flatten(localModelMatrix) );
    gl.uniform1i(gl.getUniformLocation(program, "isShaded"), 0);
    setColorUniform(rgbNormalize(255,255,255));
    gl.drawElements(gl.TRIANGLES, sphere.index.length, gl.UNSIGNED_SHORT, 0);
}