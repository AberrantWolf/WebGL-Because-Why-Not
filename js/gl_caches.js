/**
 * 
 * @param {string} name 
 */
function GetVertexShader(name) {
    if (!arguments.callee.cache) {
        arguments.callee.cache = {}
    }

    if (arguments.callee.cache[name]) {
        return arguments.callee.cache[name];
    }
    else {
        shader = new VertexShader("glsl/" + name + ".vert", name);
        arguments.callee.cache[name] = shader;
        return shader;
    }
}

/**
 * 
 * @param {string} name 
 */
function GetFragmentShader(name) {
    if (!arguments.callee.cache) {
        arguments.callee.cache = {}
    }
    
    if (arguments.callee.cache[name]) {
        return arguments.callee.cache[name];
    }
    else {
        shader = new FragmentShader("glsl/" + name + ".frag", name);
        arguments.callee.cache[name] = shader;
        return shader;
    }
}

/**
 * 
 * @param {string} vsName 
 * @param {string} fsName 
 */
function GetShaderProgram(vsName, fsName) {
    if (!arguments.callee.cache) {
        arguments.callee.cache = {}
    }
    
    let combo_name = vsName + fsName;
    if (arguments.callee.cache[combo_name]) {
        return arguments.callee.cache[combo_name];
    }
    else {
        prog = new ShaderProgram(vsName, fsName);
        arguments.callee.cache[combo_name] = prog;
        return prog;
    }
}

/**
 * 
 * @param {string} name 
 * @param {string} format 
 */
function GetMesh(meshName, format) {
    if (!arguments.callee.cache) {
        arguments.callee.cache = {}
    }
    
    let combo_name = meshName + "." + format;
    if (arguments.callee.cache[combo_name]) {
        return arguments.callee.cache[combo_name];
    }
    else {
        prog = new Mesh(meshName, format);
        arguments.callee.cache[combo_name] = prog;
        return prog;
    }
}