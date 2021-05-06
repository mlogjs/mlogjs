import { ILine } from ".";
import { IValue, LiteralValue } from "../value";

export type TLineArgs = (string | IValue)[];

export class LineBase implements ILine {
	args: TLineArgs;
	hidden = false;
    literals : LiteralValue[] = []
	constructor(...args: TLineArgs) {
		this.args = args;
	}
    addressBind(...literals: LiteralValue[]) {
        this.literals.push(...literals)
        return this
    }
	processAddressLine(addr: number) {
        for (const literal of this.literals) literal.data = addr
    }
	serialize(): string {
		return this.args.filter((v) => v).join(" ");
	}
	toString() {
		return this.serialize();
	}
}
