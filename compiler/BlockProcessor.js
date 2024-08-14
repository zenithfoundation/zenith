import ExpressionEvaluator from './ExpressionEvaluator.js';

import fs from 'fs';
import path from 'path';

export default {
    processBlocks(content) {
        let finalContent = '';
        let isInEachBlock = false;
        let eachArray = [];
        let eachItemVar = '';
        let insideEachBlockContent = '';
        let shouldProcessBlock = true;
        let conditionMet = false;
        const extractedFunctions = [];

        const blocks = content.split(/({{.*?}}|{[^}]+}|<[^>]+>)/g).filter(Boolean);

        blocks.forEach(block => {
            if (block.startsWith('<')) {
                handleHtmlBlock(block);
            } else if (block.startsWith('{each')) {
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

        generateExternalJs(extractedFunctions);
        return finalContent;

        function handleHtmlBlock(block) {
            const eventHandlerPattern = /(on:\w+)=["']([^"']+)["']/g;
            let modifiedBlock = block;

            modifiedBlock = modifiedBlock.replace(eventHandlerPattern, (match, event, handler) => {
                if (handler.includes('function')) {
                    const functionName = extractFunction(handler);
                    extractedFunctions.push({ name: functionName, body: handler });
                    return `${event}="${functionName}"`;
                } else {
                    return match;
                }
            });

            if (isInEachBlock) {
                insideEachBlockContent += modifiedBlock;
            } else {
                finalContent += modifiedBlock;
            }
        }

        function extractFunction(handler) {
            const functionName = `handler_${Math.random().toString(36).substring(2, 15)}`;
            return functionName;
        }

        function handleEachStart(block) {
            const parts = block.split('as');
            if (parts.length === 2) {
                eachArray = ExpressionEvaluator.evaluate(parts[0].replace('{each', '').trim()) || [];
                eachItemVar = parts[1].replace('}', '').trim();
                isInEachBlock = true;
                insideEachBlockContent = '';
            }
        }

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

        function handleIfCondition(block) {
            if (!conditionMet) {
                const condition = block.replace('{if', '').replace('}', '').trim();
                evaluateCondition(condition);
            } else {
                shouldProcessBlock = false;
            }
        }

        function handleElseIfCondition(block) {
            if (!conditionMet) {
                const condition = block.replace('{else if', '').replace('}', '').trim();
                evaluateCondition(condition);
            } else {
                shouldProcessBlock = false;
            }
        }

        function handleElseCondition() {
            shouldProcessBlock = !conditionMet;
            conditionMet = true;
        }

        function handleIfEnd() {
            shouldProcessBlock = true;
            conditionMet = false;
        }

        function handleContentBlock(block) {
            if (isInEachBlock) {
                insideEachBlockContent += block;
            } else if (shouldProcessBlock) {
                finalContent += evaluateContent(block);
            } else {
                finalContent += block;
            }
        }

        function evaluateCondition(condition) {
            try {
                shouldProcessBlock = ExpressionEvaluator.evaluate(condition);
                conditionMet = shouldProcessBlock;
            } catch (e) {
                console.error('Compiler Error: ' + e.message);
                shouldProcessBlock = false;
            }
        }

        function evaluateContent(block) {
            return block.replace(/{([^}]+)}/g, (match, p1) => {
                const evaluated = ExpressionEvaluator.evaluate(p1.trim());
                return typeof evaluated === 'string' ? evaluated.replace(/^"|"$/g, '') : evaluated;
            });
        }

        function generateExternalJs(functions) {
            const jsContent = functions.map(fn => `function ${fn.name} ${fn.body}`).join('\n\n');
            const outputPath = 'output.js';
            fs.writeFileSync(outputPath, jsContent, 'utf8');
            console.log(`Generated ${functions.length} functions in output.js`);
        }
    }
};
