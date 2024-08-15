import Compiler from "../compiler/Compiler.js";

const content = `
<script>
function hello()
{
    console.log("SUCA");
}
</script>
<button on:click={hello}>Click me!</button>
`;

const compileResult = Compiler.compile(content);
// The HTML code with unique IDs and without `on:click`
console.log(compileResult);

// The compiled JS will be in 'output.js'
