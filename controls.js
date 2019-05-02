/// <reference path="./main.js" />
//@ts-check

var leftMousedown = false;
var xAxis = vec3(1,0,0);
var yAxis = vec3(0,1,0);
var rotating = 1;
// var rightMousedown = false;
function initHandlers(){
    canvas.oncontextmenu = ()=>{return false;};
    canvas.addEventListener("mousedown",(event)=>{
        if(event.buttons === 1){
            leftMousedown = true;
        } 
        // else if (event.buttons === 2){
        //     rightMousedown = true;
        // }
    });
    canvas.addEventListener("mousemove", (event) => {
        // if(leftMousedown){
        //     let translateX = event.movementX  / 100;
        //     let translateY = -event.movementY / 100;
        //     translationMatrix = mult(translate(translateX, translateY, 0), translationMatrix);
        // } else
        if (leftMousedown){
            let rotateY = event.movementX / 10;
            let rotateX = event.movementY / 10;
            // modelViewMatrix = mult(modelViewMatrix, rotate(rotateX, xAxis) );
            // modelViewMatrix = mult(modelViewMatrix, rotate(rotateY, yAxis) );
            modelMatrix = mult(modelMatrix, rotate(rotateX, xAxis) );
            modelMatrix = mult(modelMatrix, rotate(rotateY, yAxis) );
            let counterX = rotate(-rotateY, yAxis);
            let counterY = rotate(-rotateX, xAxis);
            xAxis.push(1);
            yAxis.push(1);
            xAxis = mult(counterX, xAxis);
            yAxis = mult(counterY, yAxis);
            xAxis.splice(3,1);
            yAxis.splice(3,1);
        }
    });
    canvas.addEventListener("mouseup", ()=>{leftMousedown = false;});
    document.addEventListener("keydown", (event)=>{
        const step = 2;
        switch (event.code) {
        case "ArrowUp":
            fovy = clamp(10, 50, fovy - step);
            break; 
        case "ArrowDown":
            fovy = clamp(10, 50, fovy + step);
            break;
        case "KeyR":
            // translationMatrix = mat4();
            modelViewMatrix = viewMatrix;
            modelMatrix = mat4();
            xAxis = vec3(1,0,0);
            yAxis = vec3(0,1,0);
            break;
        case "KeyS":
            rotating = rotating === 1 ? 0 : 1;
            break;
        }
        updateProjectionMatrix();
    });
    canvas.addEventListener("wheel", (event) => {
        fovy = clamp(10, 50, fovy + event.deltaY/15);
        updateProjectionMatrix();
    });
}

/**
 * @param {number} lower
 * @param {number} upper
 * @param {number} value
 */
function clamp(lower, upper, value){
    return Math.max(lower, Math.min(value, upper));
}