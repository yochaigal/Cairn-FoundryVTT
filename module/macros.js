import { evaluateFormula, getInfoFromDropData } from "./utils.js";

/**
 * @param {Object} data
 * @param {Number} slot
 * @return {Promise.<void>}
 */
export const createCairnMacro = async (data, slot) => {
  const { item, actor } = await getInfoFromDropData(data);

  if (data.type !== "Item") {
    return;
  }

  if (!actor) {
    return ui.notifications.warn("You can only create macro buttons for owned Items");
  }

  if (item.type !== "weapon") {
    return ui.notifications.warn("Macros only supported for weapons");
  }

  const command = `game.cairn.rollItemMacro("${actor.id}", "${item.id}");`;
  let macro = game.macros.find((m) => m.name === item.name && m.command === command);
  if (!macro) {
    macro = await Macro.create({
      name: item.name,
      type: "script",
      img: item.img,
      command,
      flags: { "cairn.itemMacro": true },
    });
  }
  game.user.assignHotbarMacro(macro, slot);
  return false;
};

/**
 * @param {string} actorId
 * @param {string} itemId
 * @return {Promise.<void>}
 */
export const rollItemMacro = async (actorId, itemId) => {
  const actor = game.actors.get(actorId);
  const item = actor.items.get(itemId);

  if (!item && !actor) {
    return ui.notifications.warn(`Actor "${actor.name}" does not have an item named ${item.name}`);
  }

  const roll = await evaluateFormula(item.system.damageFormula, actor.getRollData());
  const flavor = `${game.i18n.localize("CAIRN.Rolling")} damage with ${item.name}`;

  roll.toMessage({
    speaker: ChatMessage.getSpeaker({ actor: actor }),
    flavor,
  });
};
