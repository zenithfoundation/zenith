import Compiler from "./Compiler.js";

export default {
    /**
     * Evaluates expressions within a specific context.
     * @param {string} content The content to evaluate
     * @param {object} context The context in which to evaluate the content
     * @return {any} The evaluated result
     */
    evaluateInContext(content, context) {
        return content.replace(/{([^}]+)}/g, (match, p1) => {
            return this.safeEvaluate(p1.trim(), context);
        });
    },

    /**
     * Safely evaluates an expression.
     * @param {string} expr The expression to evaluate
     * @return {any} The evaluated result
     */
    evaluate(expr) {
        return this.safeEvaluate(expr, {});
    },

    /**
     * A helper function that evaluates an expression safely within a context.
     * @param {string} expr The expression to evaluate
     * @param {object} context The context in which to evaluate
     * @return {any} The evaluated result
     */
    safeEvaluate(expr, context) {
        try {
            const result = new Function('Math', 'variables', 'context', `
                with (context) {
                    with (variables) {
                        return ${expr};
                    }
                }
            `)(Math, Compiler.variables, context);

            return typeof result === 'string' ? result.replace(/^"|"$/g, '') : result;
        } catch (e) {
            console.error('Evaluation Error: ' + e.message);
            return `{${expr}}`; // Return the original expression if evaluation fails
        }
    }
};
