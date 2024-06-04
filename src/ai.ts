

export interface AI {
    instruct: (instruction: string) => Promise<string>;
}