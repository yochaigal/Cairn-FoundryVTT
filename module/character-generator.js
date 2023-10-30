import { SabActor } from "./actor/actor.js";
import {
  compendiumInfoFromString, drawTableItem,
  drawTableText, findCompendiumItem,
} from './compendium.js'
import { Sab } from "./config.js";
import { evaluateFormula, formatString } from './utils.js'

/**
 * @returns {Promise.<SabActor>}
 */
export const createCharacter = async () => createActorWithCharacter(await generateCharacter());

/**
 * @param {SabActor} actor
 @returns {Promise.<SabActor>}
 */
export const regenerateActor = async (actor)  => updateActorWithCharacter(actor, await generateCharacter());

/**
 * @param {Object} characterData
 * @returns {Promise.<SabActor>}
 */
export const createActorWithCharacter = async (characterData) => {
  const data = characterToActorData(characterData);
  return SabActor.create(data);
};

/**
 * @param {SabActor} actor
 * @param {Object} characterData
 @returns {Promise.<SabActor>}
 */
export const updateActorWithCharacter = async (actor, characterData) => {
  const data = characterToActorData(characterData);
  await actor.deleteEmbeddedDocuments("Item", [], {
    deleteAll: true,
    render: false,
  });
  await actor.update(data);
  for (const token of actor.getActiveTokens()) {
    await token.document.update({
      img: actor.img,
      name: actor.name,
    });
  }
  return actor;
};

/**
 * @param {Object} items
 * @return {Promise<Object>}
 */
export const rollTextItems = async (items) => {
  const data = {};
  for (const [key, value] of Object.entries(items)) {
    const [compendium, table] = compendiumInfoFromString(value)
    data[key] = await drawTableText(compendium, table);
  }
  return data;
};

/**
 * @param {Object} items
 @return {Promise<SabItem[]>}
 */
export const rollItems = async (items) => {
  const result = [];
  for (const value of Object.values(items)) {
    const [compendium, table] = compendiumInfoFromString(value)
    result.push(await drawTableItem(compendium, table));
  }
  return result.flatMap(item => duplicate(item));
};

/**
 * @param {String} formula
 * @returns {Promise.<Object>}
 */
export const rollAbilities = async (formula) => ({
  STR: (await evaluateFormula(formula)).total,
  DEX: (await evaluateFormula(formula)).total,
  WIL: (await evaluateFormula(formula)).total
});

/**
 * @param {String} formula
 * @returns {Promise.<Number>}
 */
export const rollHitProtection = async (formula) => (await evaluateFormula(formula)).total;

/**
 * @param {String} formula
 * @returns {Promise.<Number>}
 */
export const rollGold = async (formula) => (await evaluateFormula(formula)).total;

/**
 * @param {String} formula
 * @returns {Promise.<String>}
 */
export const rollAge = async (formula) => (await evaluateFormula(formula)).total;

/**
 * @param {Object} config
 * @returns {Promise.<String>}
 */
export const rollName = async (config) => formatString(config.text, await rollTextItems(config.items));

/**
 * @param {String} config
 * @returns {Promise.<String>}
 */
export const rollBackground = async (config) => drawTableText(...compendiumInfoFromString(config));

/**
 * @param {Object} config
 * @returns {Promise.<String>}
 */
export const rollBiography = async (config) => formatString(config.text,{
  age: await rollAge(config.age),
  ...await rollTextItems(config.items)
});

/**
 * @param {Object} items
 * @returns {Promise.<SabItem[]>}
 */
export const rollStartingGear = async (items) => rollItems(items);

/**
 * @param {Object} items
 * @return {Promise<SabItem[]>}
 */
export const findStartingItems = async (items) => {
  const result = [];
  for (const compendiumItem of items) {
    const [compendium, table, quantity = 1] = compendiumInfoFromString(compendiumItem);

    const item = duplicate(await findCompendiumItem(compendium, table));

    item.system.quantity = parseInt(quantity, 10);

    result.push(item);
  }
  return result;
};

/**
 * @returns {Object}
 */
export const generateCharacter = async () => {
  console.log(`Creating new character`);

  const characterGenerator = Sab.characterGenerator;

  const abilities = await rollAbilities(characterGenerator.ability);
  const hp = await rollHitProtection(characterGenerator.hitProtection);
  const gold = await rollGold(characterGenerator.gold);
  const name = await rollName(characterGenerator.name);
  const biography = await rollBiography(characterGenerator.biography);
  const background = await rollBackground(characterGenerator.background)
  const startingItems = await findStartingItems(characterGenerator.startingItems);
  const startingGear = await rollStartingGear(characterGenerator.startingGear);

  return {
    name,
    hp,
    gold,
    abilities,
    background,
    items: [...startingItems, ...startingGear],
    biography,
  };
};

/**
 * @param {Object} characterData
 * @returns {Object}
 */
const characterToActorData = (characterData) => ({
  name: characterData.name,
  system: {
    abilities: {
      STR: { value: characterData.abilities.STR, max: characterData.abilities.STR },
      DEX: { value: characterData.abilities.DEX, max: characterData.abilities.DEX },
      WIL: { value: characterData.abilities.WIL, max: characterData.abilities.WIL },
    },
    hp: {
      max: characterData.hp,
      value: characterData.hp,
    },
    background: characterData.background,
    biography: characterData.biography,
    gold: characterData.gold,
  },
  items: characterData.items,
  token: {
    name: characterData.name,
    disposition: CONST.TOKEN_DISPOSITIONS.FRIENDLY,
    actorLink: true,
    vision: true,
  },
  type: "character",
});
