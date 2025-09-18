import { evaluateFormula, getInfoFromDropData } from "./utils.js";

/**
 * @param {Object} data
 * @param {Number} slot
 * @return {Promise.<void>}
 */
export const createCairnMacro = async (data, slot) => {
  const { item, actor } = await getInfoFromDropData(data);

  if (data.type !== "Item") {
    if (item !== undefined) {
      const macro = await Macro.create({
        name: item.name,
        type: "script",
        img: item.img,
        command: 'await foundry.applications.ui.Hotbar.toggleDocumentSheet("' + item.uuid + '")',
        flags: { "cairn.itemMacro": true },
      });
      await game.user.assignHotbarMacro(macro, slot);
    }

    return true;
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
  await game.user.assignHotbarMacro(macro, slot);
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

  if (!item || !actor) {
    return ui.notifications.warn(`Actor "${actor.name}" does not have an item named ${item.name}`);
  }

  let rollSchema = item.system.damageFormula;
  // determine panic
  const usePanic = game.settings.get("cairn", "use-panic");
  let panicLabel = "";
  if (usePanic && actor.system.panicked) {
    rollSchema = "1d4"; // panicked character
    panicLabel = "(" + game.i18n.localize("CAIRN.RollingWithPanic") + ")";
  }
  // determine roll result   
  const roll = await evaluateFormula(rollSchema, actor.getRollData());
  const label = item.name
    ? game.i18n.localize("CAIRN.RollingDmgWith") +
    ` ${item.name} ` +
    panicLabel
    : "";

  const targetedTokens = Array.from(game.user.targets).map((t) => t.id);

  let targetIds;
  if (targetedTokens.length == 0) targetIds = null;
  else if (targetedTokens.length == 1) targetIds = targetedTokens[0];
  else {
    targetIds = targetedTokens[0];
    for (let index = 1; index < targetedTokens.length; index++) {
      const element = targetedTokens[index];
      targetIds = targetIds.concat(";", element);
    }
  }
  
  const rollMessageTpl = "systems/cairn/templates/chat/dmg-roll-card.html";
  const tplData = { label: label, targets: targetIds };
  const msg = await renderTemplate(rollMessageTpl, tplData);
  roll.toMessage({    
    speaker: ChatMessage.getSpeaker({ actor: actor }),
    flavor: msg,
  });
};
