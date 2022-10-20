/** @name CONFIG.Cairn */
export const Cairn = {};

Cairn.characterGenerator = {
  ability: "3d6",
  hitProtection: "1d6",
  gold: "3d6",
  name: {
    text: "{name} {surname}",
    items: {
      name: "cairn.character-creation-tables-srd;Names",
      surname: "cairn.character-traits;Surnames"
    }
  },
  background: "cairn.character-traits;Background",
  startingItems: [
    "cairn.expeditionary-gear;Rations;1",
    "cairn.expeditionary-gear;Torch;1"
  ],
  startingGear: [
    "cairn.character-creation-tables-srd;Starting Gear - Armor",
    "cairn.character-creation-tables-srd;Starting Gear - Helmet & Shields",
    "cairn.character-creation-tables-srd;Starting Gear - Weapons",
    "cairn.character-creation-tables-srd;Starting Gear - Expeditionary Gear",
    "cairn.character-creation-tables-srd;Starting Gear - Tools",
    "cairn.character-creation-tables-srd;Starting Gear - Trinkets",
    "cairn.character-creation-tables-srd;Starting Gear - Bonus Item"
  ],
  biography: {
    text: "I have a <strong>{physique}</strong> physique, <strong>{skin}</strong> skin, <strong>{hair}</strong> hair, and a <strong>{face}</strong> face. I speak in a <strong>{speech}</strong> manner and wear <strong>{clothing}</strong> clothing. I am <strong>{vice}</strong> yet <strong>{virtue}</strong>, and I am generally regarded as <strong>{reputation}</strong>. I have had the misfortune of being <strong>{misfortune}</strong>. I am <strong>{age}</strong> years old.",
    age: "2d20 + 10",
    items: {
      physique: "cairn.character-traits;Physique",
      skin: "cairn.character-traits;Skin",
      hair: "cairn.character-traits;Hair",
      face: "cairn.character-traits;Face",
      speech: "cairn.character-traits;Speech",
      clothing: "cairn.character-traits;Clothing",
      vice: "cairn.character-traits;Vice",
      virtue: "cairn.character-traits;Virtue",
      misfortune: "cairn.character-traits;Misfortunes",
      reputation: "cairn.character-traits;Reputation"
    }
  }
};

CONFIG.Cairn = Cairn;

