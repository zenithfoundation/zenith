export interface CompileResult {
    code: string;
    variables: object;
};

export interface CompileDeclarations {
    [key: string]: string;
};