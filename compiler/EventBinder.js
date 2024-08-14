import { v4 as uuidv4 } from 'uuid'; // UUID for generating unique IDs
import { JSDOM } from 'jsdom';

export default {
    /**
     * Processes the HTML content to replace custom event bindings with unique IDs.
     * Generates JavaScript to bind event listeners based on these IDs.
     * @param {string} htmlContent The HTML content to process
     * @param {object} context The context containing variables and functions
     * @return {{html: string, js: string}} Processed HTML content and generated JavaScript
     */
    processEvents(htmlContent, context) {
        console.log(htmlContent);
        const dom = new JSDOM(htmlContent);
        const { document } = dom.window;

        let additionalJs = '';

        // Iterate over all elements to find attributes starting with "on:"
        const elements = document.querySelectorAll('*');
        elements.forEach(element => {
            Array.from(element.attributes).forEach(attr => {
                if (attr.name.startsWith('on:')) {
                    const eventType = attr.name.slice(3); // Extract event type, e.g., 'click'

                    // Corrected regular expression to match only function names
                    const handlerNameMatch = attr.value.match(/^\s*{?\s*(\w+)\s*\(?\s*\)?\s*}?$/);

                    if (handlerNameMatch) {
                        const handlerName = handlerNameMatch[1];
                        if (context.hasOwnProperty(handlerName) && typeof context[handlerName] === 'function') {
                            const uniqueId = `elem-${uuidv4()}`;
                            element.setAttribute('id', uniqueId);

                            // Generate JS to attach the event listener
                            additionalJs += `
                                document.getElementById('${uniqueId}').addEventListener('${eventType}', context.${handlerName}.bind(context));
                            `;
                        } else {
                            console.warn(`Event Binder Warning: Handler function '${handlerName}' is not defined or is not a function.`);
                        }
                    } else {
                        console.warn(`Event Binder Warning: Invalid handler syntax in '${attr.value}'. Expected format: functionName or functionName().`);
                    }

                    // Remove the custom event attribute
                    element.removeAttribute(attr.name);
                }
            });
        });

        // Serialize the DOM back to HTML
        return {
            html: document.body.innerHTML,
            js: additionalJs.trim()
        };
    }
};
