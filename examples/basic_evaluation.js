
import Compiler from "../compiler/Compiler.js";

const content = `
<h1>{5 + 5}</h1>
<h1>{Math.pow(2, 3)}</h1>
`;

const compileResult = Compiler.compile(content);

console.log(compileResult);