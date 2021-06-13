declare type TControl = "enabled" | "shoot" | "shootp" | "configure" | "color";
declare type TTarget =
	| "any"
	| "enemy"
	| "ally"
	| "player"
	| "attacker"
	| "flying"
	| "boss"
	| "ground";
declare type TSort = "distance" | "health" | "shield" | "armor" | "maxHealth";
declare class Block {
	constructor(name: string);
	write(i: number, value: number): number;
	read(i: number): number;
	printFlush(): void;
	drawFlush(): void;
	puts(...values: (number | string)[]): void;
	sensor(attr: string): number | boolean;
	control(attr: TControl, ...args: number[]): void;
	radar(target0: TTarget, target1: TTarget, target2: TTarget, sort: TSort, distance: number): any;
}

declare class Store {
	constructor(name: string);
}

declare class Temp {}

// @ts-ignore
declare const Math = {
	max: (a: number, b: number) => Math.max(a, b),
	min: (a: number, b: number) => Math.min(a, b),
	angle: (a: number, b: number) => Math.atan2(a, b),
	len: (a: number, b: number) => Math.sqrt(a ** 2 + b ** 2),
	noise: (x: any, y: any) => x + y,
	abs: (a: number) => Math.abs(a),
	log: (a: number) => Math.log(a),
	log10: (a: number) => Math.log(a) / Math.log(10),
	sin: (a: number) => Math.sin(a),
	cos: (a: number) => Math.cos(a),
	tan: (a: number) => Math.tan(a),
	floor: (a: number) => Math.floor(a),
	ceil: (a: number) => Math.ceil(a),
	sqrt: (a: number) => Math.ceil(a),
	rand: (range: number) => Math.random() * range,
};

declare function draw(
	kind:
		| "clear"
		| "color"
		| "stroke"
		| "line"
		| "rect"
		| "lineRect"
		| "poly"
		| "linePoly"
		| "triangle"
		| "image",
	...args: any
);

declare function print(...values: any): void;
declare function concat(...values: string[]): string;

declare class Entity extends Block {}
