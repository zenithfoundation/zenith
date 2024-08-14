import BlockProcessor from "./BlockProcessor.js";
import Executor from "./Executor.js";

export default {
    variables: {},

    /**
     * Compiles the content by executing script tags and processing blocks.
     * @param {string} content The content to compile
     * @return {CompileResult} The result containing compiled code and captured variables
     */
    compile(content) {
        this.resetVariables();

        // Execute all script tags found in the content
        const contentWithoutScripts = this.executeScripts(content);

        // Process remaining blocks in the content
        const finalContent = BlockProcessor.processBlocks(contentWithoutScripts);

        return {
            code: finalContent,
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
        while ((match = scriptRegex.exec(content)) !== null) {
            Executor.executeScript(match[1]);
        }
        return content.replace(scriptRegex, '');
    }
};
