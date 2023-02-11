let dynamicItem = 4;
const constantItem = 5;

print(matchItem(dynamicItem));
print(matchItem(constantItem));

itemUses(Items.copper);
itemUses(Items.coal);
itemUses(Items.silicon);

switch (dynamicItem) {
  default:
    print("always runs!\n");
}

printFlush(getBuilding("message1"));

function matchItem(n) {
  switch (n) {
    case 1:
      return Items.copper;
    case 2:
      return Items.lead;
    case 3:
      return Items.metaglass;
    case 4:
      return Items.graphite;
    case 5:
      return Items.sand;
    case 6:
      return Items.coal;
    case 7:
      return Items.titanium;
    case 8:
      return Items.thorium;
    case 9:
      return Items.scrap;
    case 10:
      return Items.silicon;
    case 11:
      return Items.plastanium;
    case 12:
      return Items.phaseFabric;
    case 13:
      return Items.surgeAlloy;
    case 14:
      return Items.sporePod;
    case 15:
      return Items.blastCompound;
    case 16:
      return Items.pyratite;
    default:
      return undefined;
  }
}

function itemUses(item) {
  switch (item) {
    case Items.copper:
      print("Basic material\n");
      print("Ammo for some units\n");
      print("Duo ammo\n");
      break;
    case Items.coal:
      print("Burn things\n");
      print("Scorch ammo\n");
      print("Energy\n");
      break;
    case Items.silicon:
      print("Silligone\n");
  }

  print("Something at the end\n");
}
