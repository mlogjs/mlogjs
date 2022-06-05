import { Compiler, CompilerOptions } from "mlogjs";

export type CompilerResult = ReturnType<Compiler["compile"]>;

export interface InputMessage {
  id: string;
  options: CompilerOptions;
  input: string;
}
export interface OutputMessage {
  id: string;
  data: CompilerResult;
}
