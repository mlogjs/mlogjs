export type TLine = (string | ValueBase)[];

export type TResLines = [ValueBase, TLine[]];

export default class ValueBase {
	serialize(): string {
		throw Error();
	}

	//////////////////////////////////////////////////////////////////////////////////////////////////////
	//
	//									GETTER AND SETTER
	//
	//////////////////////////////////////////////////////////////////////////////////////////////////////

	get(): TResLines {
		throw Error();
	}
	set(value: ValueBase): TResLines {
		throw Error();
	}

	//////////////////////////////////////////////////////////////////////////////////////////////////////
	//
	//									MEMBER GETTER AND SETTER
	//
	//////////////////////////////////////////////////////////////////////////////////////////////////////

	getMember(index: ValueBase, value: ValueBase): TResLines {
		throw Error();
	}
	setMember(index: ValueBase, value: ValueBase): TResLines {
		throw Error();
	}
	getDotMember(index: ValueBase, value: ValueBase): TResLines {
		throw Error();
	}
	setDotMember(index: ValueBase, value: ValueBase): TResLines {
		throw Error();
	}

	//////////////////////////////////////////////////////////////////////////////////////////////////////
	//
	//									FUNCTION
	//
	//////////////////////////////////////////////////////////////////////////////////////////////////////

	call(args: ValueBase[]): TResLines {
		throw Error();
	}

	//////////////////////////////////////////////////////////////////////////////////////////////////////
	//
	//									ASSIGNMENT OPERATORS
	//
	//////////////////////////////////////////////////////////////////////////////////////////////////////

	"="(value: ValueBase): TResLines {
		throw Error();
	}
	"+="(value: ValueBase): TResLines {
		throw Error();
	}
	"-="(value: ValueBase): TResLines {
		throw Error();
	}
	"*="(value: ValueBase): TResLines {
		throw Error();
	}
	"/="(value: ValueBase): TResLines {
		throw Error();
	}
	"%="(value: ValueBase): TResLines {
		throw Error();
	}
	"**="(value: ValueBase): TResLines {
		throw Error();
	}
	"<<="(value: ValueBase): TResLines {
		throw Error();
	}
	">>="(value: ValueBase): TResLines {
		throw Error();
	}
	">>>="(value: ValueBase): TResLines {
		throw Error();
	}
	"&="(value: ValueBase): TResLines {
		throw Error();
	}
	"^="(value: ValueBase): TResLines {
		throw Error();
	}
	"|="(value: ValueBase): TResLines {
		throw Error();
	}
	"&&="(value: ValueBase): TResLines {
		throw Error();
	}
	"||="(value: ValueBase): TResLines {
		throw Error();
	}
	"??="(value: ValueBase): TResLines {
		throw Error();
	}

	//////////////////////////////////////////////////////////////////////////////////////////////////////
	//
	//									COMPARISON OPERATORS
	//
	//////////////////////////////////////////////////////////////////////////////////////////////////////

	"=="(value: ValueBase): TResLines {
		throw Error();
	}
	"!="(value: ValueBase): TResLines {
		throw Error();
	}

	"==="(value: ValueBase): TResLines {
		throw Error();
	}

	"!=="(value: ValueBase): TResLines {
		throw Error();
	}

	">"(value: ValueBase): TResLines {
		throw Error();
	}

	">="(value: ValueBase): TResLines {
		throw Error();
	}
	"<"(value: ValueBase): TResLines {
		throw Error();
	}

	"<="(value: ValueBase): TResLines {
		throw Error();
	}

	//////////////////////////////////////////////////////////////////////////////////////////////////////
	//
	//									ARITHMETIC OPERATIONS
	//
	//////////////////////////////////////////////////////////////////////////////////////////////////////

	"+"(value: ValueBase): TResLines {
		throw Error();
	}
	"-"(value: ValueBase): TResLines {
		throw Error();
	}
	"*"(value: ValueBase): TResLines {
		throw Error();
	}
	"/"(value: ValueBase): TResLines {
		throw Error();
	}
	"**"(value: ValueBase): TResLines {
		throw Error();
	}
	"%"(value: ValueBase): TResLines {
		throw Error();
	}
	"++"(): TResLines {
		throw Error();
	}
	"--"(): TResLines {
		throw Error();
	}
	"u+"(value: ValueBase): TResLines {
		throw Error();
	}
	"u-"(value: ValueBase): TResLines {
		throw Error();
	}

	//////////////////////////////////////////////////////////////////////////////////////////////////////
	//
	//									BITWISE OPERATORS
	//
	//////////////////////////////////////////////////////////////////////////////////////////////////////

	"&"(value: ValueBase): TResLines {
		throw Error();
	}
	"|"(value: ValueBase): TResLines {
		throw Error();
	}
	"^"(value: ValueBase): TResLines {
		throw Error();
	}
	"u~"(value: ValueBase): TResLines {
		throw Error();
	}
	"<<"(value: ValueBase): TResLines {
		throw Error();
	}
	">>"(value: ValueBase): TResLines {
		throw Error();
	}
	">>>"(value: ValueBase): TResLines {
		throw Error();
	}

	//////////////////////////////////////////////////////////////////////////////////////////////////////
	//
	//									LOGICAL OPERATORS
	//
	//////////////////////////////////////////////////////////////////////////////////////////////////////

	"&&"(value: ValueBase): TResLines {
		throw Error();
	}
	"||"(value: ValueBase): TResLines {
		throw Error();
	}
	"u!"(value: ValueBase): TResLines {
		throw Error();
	}
}
