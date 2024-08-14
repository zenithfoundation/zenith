
import Compiler from "../compiler/Compiler.js";

const content = `
<script>
    const arr = ["Mark", "John", "Luke"];
</script>

{each arr as item}
   <h1>{item}</h1>
{/each}
`;

const compileResult = Compiler.compile(content);

console.log(compileResult);