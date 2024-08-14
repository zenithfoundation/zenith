import Compiler from "./Compiler.js";

export default {
    /**
     * Executes the script content, capturing variables and functions.
     * @param {string} scriptContent The script content to execute
     * @return {void}
     */
    executeScript(scriptContent) {
        const declarations = extractDeclarations(scriptContent);

        // Execute the script in a safe sandbox environment
        const sandbox = {};
        const result = executeInSandbox(scriptContent, sandbox, declarations);

        // Merge the captured variables with the global compiler variables
        Object.assign(Compiler.variables, result);
    }
};

/**
 * Executes the script content in a sandboxed environment.
 * @param {string} scriptContent The script content to execute
 * @param {object} sandbox The sandbox object to execute within
 * @param {object} declarations The extracted variable and function declarations
 * @return {object} The captured variables after execution
 */
function executeInSandbox(scriptContent, sandbox, declarations) {
    const scriptFunction = new Function('sandbox', `
        const result = {};
        Object.assign(this, sandbox);
        ${scriptContent}
        ${Object.keys(declarations).map(key => `
            if (typeof ${key} !== 'undefined') {
                result.${key} = ${key};
            }
        `).join('\n')}
        return result;
    `);

    return scriptFunction.call(sandbox, sandbox);
}

/**
 * Extracts variable, function, and class declarations from the script content.
 * @param {string} scriptContent The script content to analyze
 * @return {CompileDeclarations} An object mapping names to their types (variable, function, class)
 */
function extractDeclarations(scriptContent) {
    const declarations = {};

    // Extract variable declarations
    const variablePattern = /(?:const|let|var)\s+(\w+)\s*=/g;
    extractPatternMatches(scriptContent, variablePattern, declarations, 'undefined');

    // Extract function declarations
    const functionPattern = /function\s+(\w+)\s*\(/g;
    extractPatternMatches(scriptContent, functionPattern, declarations, 'function');

    // Extract class declarations
    const classPattern = /class\s+(\w+)/g;
    extractPatternMatches(scriptContent, classPattern, declarations, 'class');

    return declarations;
}

/**
 * Helper function to extract matches based on a pattern and store them in declarations.
 * @param {string} content The content to search within
 * @param {RegExp} pattern The pattern to match
 * @param {object} declarations The object to store the matches
 * @param {string} value The value to assign to the matched key
 * @return {void}
 */
function extractPatternMatches(content, pattern, declarations, value) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
        declarations[match[1]] = value;
    }
}
