class ShaderBase extends BWN_LoadableText {
    /**
     * 
     * @param {string} file_uri 
     * @param {string} shader_name 
     */
    constructor(file_uri, shader_name) {
        super(file_uri);
        this.name = shader_name;
        if (!gl) {
            console.log("GL NOT FOUND");
        }
    }
    
    /**
     * @param {XMLHttpRequest} xhttp 
     */
    handleXhttpSuccess(xhttp) {
        this.source = xhttp.response;
        this.value = this.buildShader();
    }

    buildShader() {
        console.log("building shader " + this.name + " " + this.getShaderTypeString());

        let shader = gl.createShader(this.getShaderType());
        gl.shaderSource(shader, this.source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            let error = gl.getShaderInfoLog(shader);
            console.log("ERROR compiling shader: " + error);
            gl.deleteShader(this.shader);
            this.status = "ERROR: " + error;
            return null;
        }

        this._status = "SUCCESS";        
        return shader;
    }

    getShaderType() {
        console.log("ERROR: Don't try to use base classes -- BWN_LoadableShaderBase");
        return null;
    }

    getShaderTypeString() {
        return 'non-type-error';
    }

    getStatus() {
        return this._status;
    }
}

// Vertex shader variant merely supplies a couple different values for arguments
class VertexShader extends ShaderBase {
    getShaderType() {
        return gl.VERTEX_SHADER;
    }

    getShaderTypeString() {
        return 'VERTEX';
    }
}

// Fragment shader variant merely supplies a couple different values for arguments
class FragmentShader extends ShaderBase {
    getShaderType() {
        return gl.FRAGMENT_SHADER;
    }

    getShaderTypeString() {
        return 'FRAGMENT';
    }
}

// ShaderProgram takes two shaders and links them. This is the actual class you'd
// want to use if you are making custom shaders, as you are required to have both
// vertex and fragment shaders; and nothing can be drawn without a linked program.
class ShaderProgram {
    /**
     * 
     * @param {string} vsName 
     * @param {string} fsName 
     */
    constructor(vsName, fsName) {
        let vs = GetVertexShader(vsName);
        let fs = GetFragmentShader(fsName);

        this.isValid = false;

        let this_ = this;

        this.promise = Promise.all([vs.promise, fs.promise]).then(() => {
            let program = gl.createProgram();
            gl.attachShader(program, vs.value);
            gl.attachShader(program, fs.value);
            gl.linkProgram(program);

            if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
                console.log("Unable to link shaders: '" + vsName + "(VERTEX)' and '" + fsName + "': " + gl.getProgramInfoLog(program));
            }
            
            this_.aPosition = gl.getAttribLocation(program, 'aVertexPosition');

            this_.pUniform = gl.getUniformLocation(program, 'uPMatrix');
            this_.mvUniform = gl.getUniformLocation(program, 'uMVMatrix');
            
            this_.program = program;
            this_.isValid = true;
        }).catch((reason) => {
            console.log("ERROR loading shaders: " + reason);
        });
    }

    get value() {
        if (this.isValid)
            return this.program;
        return null;
    }

    get positionAttribute() {
        return this.aPosition;
    }

    /**
     * 
     * @param {Matrix} projection 
     */
     set projectionMatrix(projection) {
        //console.log("setting pUniform");
        gl.uniformMatrix4fv(this.pUniform, false, new Float32Array(projection.flatten()));
    }

    /**
     * 
     * @param {Matrix} projection 
     */
    set modelviewMatrix(modelview) {
        //console.log("setting mvUniform");
        gl.uniformMatrix4fv(this.mvUniform, false, new Float32Array(modelview.flatten()));
    }

    bind() {
        gl.useProgram(this.program);
        gl.enableVertexAttribArray(positionAttrib);
    }
}

// Mesh class for drawing a mesh. You wouldn't use this directly, but rather
// use the loader functions from caches.
class Mesh extends BWN_LoadableText {
    /**
     * 
     * @param {string} file_uri 
     * @param {string} file_type 
     */
    constructor(file_uri, file_type) {
        super("mesh/" + file_uri + "." + file_type);
        this.name = file_uri;
        this.file_type = file_type;
        this.meshData = "";
        this.vertices = [];
        this.faces = [];
    }
    
    /**
     * @param {XMLHttpRequest} xhttp 
     */
    handleXhttpSuccess(xhttp) {
        this.meshData = xhttp.response;

        switch (this.file_type) {
            case "obj":
                this.importOBJMesh();
                break;
            default:
                console.log("Unknown mesh data type, cannot import");    
        }
    }

    importOBJMesh() {
        console.log("Importing OBJ data: " + this.name);
        let lines = this.meshData.split("\n");
        //console.log("   " + lines.length + " lines");
        for (let i = 0; i < lines.length; i++) {
            let elems = lines[i].trim().split(" ");
            
            if (elems.length < 3) {
                continue;
            }
            
            switch (elems[0]) {
                case "v":
                    this.handleOBJVertexElements(elems);    
            }
        }

        // Make all the GL stuff for this mesh data taht we loaded
        this.vertBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
        
        let err = gl.getError();
        if (err !== gl.NO_ERROR) {
            console.log("   ERROR binding to GL: " + err);
        }
    }

    /**
     * 
     * @param {string[]} elems 
     */    
    handleOBJVertexElements(elems) {
        //console.log("   LINE (" + elems.length + ") " + line);
        if (elems.length < 4) {
            console.log("   Vertex line doesn't have enough elements: \"" + elems.join(" ") + "\"");
            return;
        }

        // Copy verts 1, 2, and 3 into the array 
        if (elems.length == 4) {
            this.vertices = this.vertices.concat(elems.slice(1, 4));
        } else {
            console.log("   Vertex line has too many elements: \"" + elems.join(" ") + "\"");
        }
    }

    handleOBJFaceElements(elems) {
        if (elems.length < 4) {
            console.log("   Face line doesn't have enough elements: \"" + elems.join(" ") + "\"");
            return;
        }

        this.faces.push(elems.slice(1, 4));
    }

    bind() {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertBuffer);
    }

    draw() {
        gl.drawArrays(gl.TRIANGLE_FAN, 0, this.vertices.length/3);
    }
}

// Renderable objects are the lowest base class of a thing that can
// be rendered to the screen.
class Renderable {
    /**
     * @param {Mesh} mesh 
     * @param {ShaderProgram} shader
     */
    constructor(mesh, shader) {
        this.mesh = mesh;
        this.shader = shader;
    }

    render() {
        this.shader.bind();

        this.shader.projectionMatrix = idMatrix;
        this.shader.modelviewMatrix = mvMatrix;

        this.mesh.bind();        
        gl.vertexAttribPointer(this.shader.positionAttribute, 3, gl.FLOAT, false, 0, 0);
        this.mesh.draw();
    }

    get promise() {
        return Promise.all([this.mesh.promise, this.shader.promise]);
    }
}