import ExpressionEvaluator from './ExpressionEvaluator.js';

export default {
    /**
     * Process the content blocks by splitting, evaluating, and rendering dynamic content.
     * @param {string} content The content to process
     * @return {string} The processed content with all blocks evaluated and rendered
     */
    processBlocks(content) {
        let finalContent = '';
        let isInEachBlock = false;
        let eachArray = [];
        let eachItemVar = '';
        let insideEachBlockContent = '';
        let shouldProcessBlock = true;
        let conditionMet = false;

        // Split content into blocks based on delimiters
        const blocks = content.split(/(\{[^}]*\})/g).filter(Boolean);

        // Iterate over each block
        blocks.forEach(block => {
            block = block.trim();

            if (block.startsWith('{each')) {
                handleEachStart(block);
            } else if (block.startsWith('{/each')) {
                handleEachEnd();
            } else if (block.startsWith('{if')) {
                handleIfCondition(block);
            } else if (block.startsWith('{else if')) {
                handleElseIfCondition(block);
            } else if (block.startsWith('{else')) {
                handleElseCondition();
            } else if (block.startsWith('{/if')) {
                handleIfEnd();
            } else {
                handleContentBlock(block);
            }
        });

        return finalContent;

        /**
         * Handle the start of an {each} block.
         * @param {string} block The {each} block content
         */
        function handleEachStart(block) {
            const parts = block.split('as');
            if (parts.length === 2) {
                eachArray = ExpressionEvaluator.evaluate(parts[0].replace('{each', '').trim()) || [];
                eachItemVar = parts[1].replace('}', '').trim();
                isInEachBlock = true;
                insideEachBlockContent = '';
            }
        }

        /**
         * Handle the end of an {each} block.
         */
        function handleEachEnd() {
            isInEachBlock = false;
            if (Array.isArray(eachArray)) {
                eachArray.forEach(item => {
                    let itemContent = insideEachBlockContent;
                    const itemContext = { [eachItemVar]: item };
                    itemContent = ExpressionEvaluator.evaluateInContext(itemContent, itemContext);
                    finalContent += itemContent;
                });
            }
            insideEachBlockContent = '';
        }

        /**
         * Handle the {if} block by evaluating the condition.
         * @param {string} block The {if} block content
         */
        function handleIfCondition(block) {
            if (!conditionMet) {
                const condition = block.replace('{if', '').replace('}', '').trim();
                evaluateCondition(condition);
            } else {
                shouldProcessBlock = false;
            }
        }

        /**
         * Handle the {else if} block by evaluating the condition.
         * @param {string} block The {else if} block content
         */
        function handleElseIfCondition(block) {
            if (!conditionMet) {
                const condition = block.replace('{else if', '').replace('}', '').trim();
                evaluateCondition(condition);
            } else {
                shouldProcessBlock = false;
            }
        }

        /**
         * Handle the {else} block by toggling the process flag based on previous conditions.
         */
        function handleElseCondition() {
            shouldProcessBlock = !conditionMet;
            conditionMet = true; // Mark that a condition has been met
        }

        /**
         * Reset the processing flags at the end of an {if} block.
         */
        function handleIfEnd() {
            shouldProcessBlock = true;
            conditionMet = false; // Reset conditionMet for next {if} block
        }

        /**
         * Handle content blocks outside of control structures.
         * @param {string} block The content block to handle
         */
        function handleContentBlock(block) {
            if (isInEachBlock) {
                insideEachBlockContent += block;
            } else if (shouldProcessBlock) {
                finalContent += evaluateContent(block);
            }
        }

        /**
         * Evaluate a condition using the ExpressionEvaluator.
         * @param {string} condition The condition to evaluate
         */
        function evaluateCondition(condition) {
            try {
                shouldProcessBlock = ExpressionEvaluator.evaluate(condition);
                conditionMet = shouldProcessBlock;
            } catch (e) {
                console.error('Compiler Error: ' + e.message);
                shouldProcessBlock = false;
            }
        }

        /**
         * Evaluate and replace expressions within a content block.
         * @param {string} block The content block to evaluate
         * @return {string} The evaluated content block
         */
        function evaluateContent(block) {
            return block.replace(/{([^}]+)}/g, (match, p1) => {
                const evaluated = ExpressionEvaluator.evaluate(p1.trim());
                return typeof evaluated === 'string' ? evaluated.replace(/^"|"$/g, '') : evaluated;
            });
        }
    }
};
