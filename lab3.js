/*
*	Katie Hadgis
*	CS452 Computer Graphics
*	Homework #3
*	03/01/15
*
*
*	lab3.js:
*	- creates 16 faced 3-D star object initially set to rotate 15 deg. on x axis
*   	- simple lighting and shading, blue with gold luster
*   	- user arrow keys to rotate object forward/backward on x and y axes
*   	- click on button to pause/play rotation
*   	- I tried making sure the normals are all facing the right direction, 
*         but it still seems like a few faces are flipped. Maybe it's
*         just me.
*	
*/
var canvas;
var gl;

var NumVertices  = 72;

var points = [];
var colors = [];
var normalsArray = [];

var lightPosition = vec4(0.0, 0.0, 1.0, 0.0 );
var lightAmbient = vec4(0.0, 0.2, 0.7, 1.0 );
var lightDiffuse = vec4( 0.0, 0.7, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 0.5, 0.7, 0.5, 1.0 );
var materialDiffuse = vec4( 0, 1.0, 0.3, 1.0);
var materialSpecular = vec4( 1.0, 1.0, 0.0, 1.0 );
var materialShininess = 50.0;

var ctm;
var ambientColor, diffuseColor, specularColor;
var modelView, projection;
var viewerPos;
var program;

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;

var axis = 1;
var theta = [ 15, 0, 0 ];
var m = 1;

var thetaLoc;

var flag = true;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
	
    colorCube();
	
	var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );
	
	var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW )

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    thetaLoc = gl.getUniformLocation(program, "theta"); 
    
	viewerPos = vec3(0.0, 0.0, 0.0 );

    projection = ortho(-1, 1, -1, 1, -100, 100);
    
    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);
	
    //event listeners for buttons
    document.getElementById("ButtonT").onclick = function(){flag = !flag;};
	document.onkeydown = function(e) {
		switch (e.keyCode) {
			case 37:
				//left - CCW y
				axis = yAxis;
				m = -1;
				break;
			case 38:
				//up - CCW x
				axis = xAxis;
				m = -1;
				break;
			case 39:
				//right - CW y
				axis = yAxis;
				m = 1;
				break;
			case 40:
				//down - CW x
				axis = xAxis;
				m = 1;
				break;
		}
	};

    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"),
       flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"),
       flatten(diffuseProduct) );
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"), 
       flatten(specularProduct) );	
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"), 
       flatten(lightPosition) );
       
    gl.uniform1f(gl.getUniformLocation(program, "shininess"),materialShininess);
    
    gl.uniformMatrix4fv( gl.getUniformLocation(program, "projectionMatrix"),false, flatten(projection));    
    
    render();
}
function colorCube()
{
    quad( 1,2,8,5 );
	quad( 6,5,8,2 );
	quad( 4,7,9,0 );
	quad( 3,0,9,7 );
	quad( 6,2,10,7 );
	quad( 10,2,3,7 );
	quad( 5,4,11,1 );
	quad( 0,1,11,4 );
	quad( 2,1,12,3 );
	quad( 0,3,12,1 );
	quad( 6,5,13,7 );
	quad( 4,7,13,5 );
}
function quad(a, b, c, d) 
{
    var vertices = [
        [-0.2, 	-0.2,  	0.2, 	1.0 ], //0
        [-0.2,  0.2,  	0.2, 	1.0 ], //1
        [0.2,  	0.2,  	0.2, 	1.0 ], //2
        [0.2, 	-0.2,  	0.2, 	1.0 ], //3
        [-0.2, 	-0.2, 	-0.2, 	1.0 ], //4 
        [-0.2,  0.2, 	-0.2, 	1.0 ], //5 
        [0.2,	0.2, 	-0.2, 	1.0 ], //6 
        [0.2,	-0.2, 	-0.2, 	1.0 ], //7
		[0, 	1.0, 	0, 		1.0 ], //8 
		[0, 	-1.0, 	0, 		1.0 ], //9
		[1.0, 	0, 		0, 		1.0 ], //10
		[-1.0, 0, 		0, 		1.0 ], //11
		[0,		0,		1.0,	1.0 ], //12
		[0,		0,		-1.0,	1.0 ]  //13
    ];
/*
    var vc = new Array(8);
    for(var i = 0; i<8; i++) vc[i] = new Float32Array(8);
    vc[0]  =  [ 0.0, 0.0, 0.0, 1.0 ];
	*/

    // We need to parition the quad into two triangles in order for
    // WebGL to be able to render it.  In this case, we create two
    // triangles from the quad indices
    
    //vertex color assigned by the index of the vertex
    
    var t1 = subtract(vertices[b], vertices[a]);
     var t2 = subtract(vertices[c], vertices[b]);
     var normal = cross(t1, t2);
     var normal = vec3(normal);


     points.push(vertices[a]); 
     normalsArray.push(normal); 
     points.push(vertices[b]); 
     normalsArray.push(normal); 
     points.push(vertices[c]); 
     normalsArray.push(normal);   
     points.push(vertices[a]);  
     normalsArray.push(normal); 
     points.push(vertices[c]); 
     normalsArray.push(normal); 
     points.push(vertices[d]); 
     normalsArray.push(normal);    
	/*
    for ( var i = 0; i < indices1.length; ++i ) {
        points.push( vertices[indices1[i]] );
        //colors.push( vertexColors[indices[i]] );
    
        // for solid colored faces use 
        colors.push([ 0.5, 0.8, 1.0, 1.0 ]);
        
    }
	*/
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if(flag) theta[axis] += 2.0*m;
    gl.uniform3fv(thetaLoc, theta);
    
	modelView = mat4();
    modelView = mult(modelView, rotate(theta[xAxis], [1, 0, 0] ));
    modelView = mult(modelView, rotate(theta[yAxis], [0, 1, 0] ));
    modelView = mult(modelView, rotate(theta[zAxis], [0, 0, 1] ));
    
    gl.uniformMatrix4fv( gl.getUniformLocation(program,
            "modelViewMatrix"), false, flatten(modelView) );
	
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );

    requestAnimFrame( render );
}
