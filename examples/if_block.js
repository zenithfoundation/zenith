
import Compiler from "../compiler/Compiler.js";

const content = `
<script>
    const a = 10;
    const b = 20;
</script>

{if a > b}
    <h1>A is greater than B</h1>
{else}
    <h1>B is greater than A</h1>
{/if}
`;

const compileResult = Compiler.compile(content);

console.log(compileResult);