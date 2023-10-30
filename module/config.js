/** @name CONFIG.Sab */
export const Sab = {};

Sab.characterGenerator = {
  ability: "3d6",
  hitProtection: "1d6",
  gold: "3d6",
  name: {
    text: "{name} {surname}",
    items: {
      name: "sab.character-creation-tables-srd;Names",
      surname: "sab.character-traits;Surnames"
    }
  },
  background: "sab.character-traits;Background",
  startingItems: [
    "sab.expeditionary-gear;Rations;1",
    "sab.expeditionary-gear;Torch;1"
  ],
  startingGear: [
    "sab.character-creation-tables-srd;Starting Gear - Armor",
    "sab.character-creation-tables-srd;Starting Gear - Helmet & Shields",
    "sab.character-creation-tables-srd;Starting Gear - Weapons",
    "sab.character-creation-tables-srd;Starting Gear - Expeditionary Gear",
    "sab.character-creation-tables-srd;Starting Gear - Tools",
    "sab.character-creation-tables-srd;Starting Gear - Trinkets",
    "sab.character-creation-tables-srd;Starting Gear - Bonus Item"
  ],
  biography: {
    text: "I have a <strong>{physique}</strong> physique, <strong>{skin}</strong> skin, <strong>{hair}</strong> hair, and a <strong>{face}</strong> face. I speak in a <strong>{speech}</strong> manner and wear <strong>{clothing}</strong> clothing. I am <strong>{vice}</strong> yet <strong>{virtue}</strong>, and I am generally regarded as <strong>{reputation}</strong>. I have had the misfortune of being <strong>{misfortune}</strong>. I am <strong>{age}</strong> years old.",
    age: "2d20 + 10",
    items: {
      physique: "sab.character-traits;Physique",
      skin: "sab.character-traits;Skin",
      hair: "sab.character-traits;Hair",
      face: "sab.character-traits;Face",
      speech: "sab.character-traits;Speech",
      clothing: "sab.character-traits;Clothing",
      vice: "sab.character-traits;Vice",
      virtue: "sab.character-traits;Virtue",
      misfortune: "sab.character-traits;Misfortunes",
      reputation: "sab.character-traits;Reputation"
    }
  }
};

CONFIG.Sab = Sab;

