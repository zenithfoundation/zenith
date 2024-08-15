import { v4 as uuidv4 } from 'uuid';
import { JSDOM } from 'jsdom';

export default {
    processEvents(htmlContent) {
        // Step 1: Replace `on:` attributes with placeholders and generate unique IDs
        let modifiedHtml = htmlContent.replace(/on:(\w+)={([\s\S]*?)}/g, (match, eventType, handlerContent) => {
            // Add the closing curly bracket to the handler content
            match += '}';
            handlerContent += '}';

            // Rest of the code remains the same
            console.table({ match, eventType, handlerContent });
            // Generate a unique ID for the element
            const uniqueId = `elem_${uuidv4().replace(/-/g, '')}`;

            // Properly escape handler content for safe insertion into JS
            const escapedHandler = handlerContent
                .replace(/<\/script>/g, '<\\/script>') // Escape end script tags
                .replace(/<\/(script|style|textarea)>/g, '<\\/\\1>') // Escape closing tags
                .replace(/[\r\n]+/g, ' ') // Replace newlines with spaces
                .trim() + '}';
            // Return the modified HTML with ID and custom data attributes
            return `id="${uniqueId}" data-event="${eventType}" data-handler="${encodeURIComponent(escapedHandler)}"`;
        });

        // <button id="elem_500ed0f0cc4c454da1a27ad0a2f9623d" data-event="click" data-handler="()%20%3D%3E%20%7Bconsole.log(%22SUCA%22)%7D"}>Click me!</button> remove the last } that is causing issues on parsing
        // Remove the last } that is causing parsing issues
        modifiedHtml = modifiedHtml.replace('}', '');
        console.log(modifiedHtml);
        // Create a new JSDOM instance with the modified HTML
        const dom = new JSDOM(modifiedHtml);
        const { document } = dom.window;

        // Prepare the JavaScript code for event handlers
        let additionalJs = '';
        const elements = document.querySelectorAll('[data-event]'); // Target elements with data-event attribute

        elements.forEach(element => {
            const uniqueId = element.getAttribute('id');
            const eventType = element.getAttribute('data-event');
            const handlerContent = decodeURIComponent(element.getAttribute('data-handler'));

            if (eventType && handlerContent) {
                // Remove the temporary attributes
                element.removeAttribute('data-event');
                element.removeAttribute('data-handler');

                // Clean the handler content to ensure valid JavaScript code
                // Fixing potential issues with trailing characters
                const cleanedHandlerContent = handlerContent
                    .replace(/^\s*\{/, '') // Remove leading brace if present
                    .replace(/\}\s*$/, '') // Remove trailing brace if present
                    .trim();

                // Create the event listener JavaScript code
                additionalJs += `
                    document.getElementById('${uniqueId}').addEventListener('${eventType}',${cleanedHandlerContent});
                `;
            }
        });

        // Use innerHTML to get the raw HTML without entity encoding
        const rawHtml = document.body.innerHTML;

        return {
            html: rawHtml,
            js: additionalJs.trim()
        };
    }
};
