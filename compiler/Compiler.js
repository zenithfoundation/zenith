import BlockProcessor from "./BlockProcessor.js";
import Executor from "./Executor.js";
import EventBinder from "./EventBinder.js";
import fs from 'fs'; // Node.js file system module to write files

export default {
    variables: {},

    /**
     * Compiles the content by executing script tags, processing blocks, and binding events.
     * @param {string} content The content to compile
     * @return {CompileResult} The result containing compiled code and captured variables
     */
    compile(content) {
        this.resetVariables();

        // Execute all script tags found in the content
        const contentWithoutScripts = this.executeScripts(content);

        // Process remaining blocks in the content
        const processedContent = BlockProcessor.processBlocks(contentWithoutScripts);

        // Bind events and generate additional JS
        const { html, js } = EventBinder.processEvents(processedContent, this.variables);

        // Write the additional JS to a file
        this.writeJsFile(js);

        return {
            code: html,
            variables: this.variables
        };
    },

    /**
     * Resets the variables storage before compilation.
     * @return {void}
     */
    resetVariables() {
        this.variables = {};
    },

    /**
     * Extracts and executes all script tags from the content.
     * @param {string} content The content to process
     * @return {string} Content without script tags
     */
    executeScripts(content) {
        const scriptRegex = /<script>([\s\S]*?)<\/script>/g;
        let match;
        let contentWithoutScripts = content;
        while ((match = scriptRegex.exec(content)) !== null) {
            const scriptContent = match[1];
            const capturedVariables = Executor.executeScript(scriptContent);
            Object.assign(this.variables, capturedVariables);
            contentWithoutScripts = contentWithoutScripts.replace(match[0], '');
        }
        return contentWithoutScripts;
    },

    /**
     * Writes the generated JS to an external file.
     * @param {string} jsContent The JavaScript content to write to the file
     */
    writeJsFile(jsContent) {
        const outputPath = './output.js'; // Path where the JS file will be saved
        fs.writeFileSync(outputPath, jsContent);
    },

    // Other methods like executeScripts, resetVariables, etc.
};
