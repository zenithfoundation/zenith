
import Compiler from "../compiler/Compiler.js";

const content = `
<script>
    const a = 1;
</script>

{if a == 1}
    <h1>A equals 1</h1>
{else if a == 2}
    <h1>A equals 2</h1>
{else if a == 3}
    <h1>A equals 3</h1>
{else}
    <h1>A is not 1, 2 or 3</h1>
{/if}
`;

const compileResult = Compiler.compile(content);

console.log(compileResult);