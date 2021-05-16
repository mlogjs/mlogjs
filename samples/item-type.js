function getItemType(c) {
	if (c === 1) return "@copper";
	else if (c === 2) return "@lead";
	else if (c === 3) return "@metaglass";
	else if (c === 4) return "@graphite";
	else if (c === 5) return "@sand";
	else if (c === 6) return "@coal";
	else if (c === 7) return "@titanium";
	else if (c === 8) return "@thorium";
	else if (c === 9) return "@scrap";
	else if (c === 10) return "@silicon";
	else if (c === 11) return "@plastanium";
	else if (c === 12) return "@phase-fabric";
	else if (c === 13) return "@surge-alloy";
	else if (c === 14) return "@spore-pod";
	else if (c === 15) return "@blast-compound";
	else if (c === 16) return "@pyratite";
	else return "null";
}

// let type = 3
const msg1 = Block("message1");
msg1.puts(getItemType(3));
