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
	write(i: number, value: number): number;
	read(i: number): number;
	printFlush(): void;
	drawFlush(): void;
	puts(...values: (number | string)[]): void;
	sensor(attr: string): number | boolean;
	control(attr: TControl, ...args: number[]): void;
	radar(target0: TTarget, target1: TTarget, target2: TTarget, sort: TSort, distance: number): any;
}

declare const Entity = Block;