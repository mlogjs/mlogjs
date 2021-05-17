function getItemType(c) {
	if (c === 1) return "@copper";
	if (c === 2) return "@lead";
	if (c === 3) return "@metaglass";
	if (c === 4) return "@graphite";
	if (c === 5) return "@sand";
	if (c === 6) return "@coal";
	if (c === 7) return "@titanium";
	if (c === 8) return "@thorium";
	if (c === 9) return "@scrap";
	if (c === 10) return "@silicon";
	if (c === 11) return "@plastanium";
	if (c === 12) return "@phase-fabric";
	if (c === 13) return "@surge-alloy";
	if (c === 14) return "@spore-pod";
	if (c === 15) return "@blast-compound";
	if (c === 16) return "@pyratite";
	return "null";
}

let type = 3
const msg1 = Block("message1");
msg1.puts(getItemType(type));
