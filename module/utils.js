/**
 * @param {String} formula
 * @param {Object} [data]
 * @return {Promise<Roll>}
 */
export const evaluateFormula = async (formula, data) => {
  const roll = new Roll(formula, data);
  return roll.evaluate({ async: true });
};

/**
 * @param {String} str
 * @param {Object} data
 * @return {String}
 */
export const formatString = (str, data = {}) => {
  const fmt = /\{[^\}]+\}/g;
  str = str.replace(fmt, k => {
    return data[k.slice(1, -1)];
  });
  return str;
}

/* V10/V9 compatibility */
/**
 * @param {TableResult} result
 * @return {String}
 */
export const getResultType = (result) => result.type ?? result.data.type;

/**
 * @param {TableResult} result
 * @return {String}
 */
export const getResultCollection = (result) => result.documentCollection ?? result.data.collection;

/**
 * @param {TableResult} result
 * @return {String}
 */
export const getResultText = (result) => result.text ?? result.data.text;

/**
 * @param {Macro} macro
 * @return {String}
 */
export const getMacroCommand = (macro) => macro.command ?? macro.data.command;

/**
 * @param {Combatant} combatant
 * @return {Number}
 */
export const getCombatantInitiative = (combatant) => combatant.initiative ?? combatant.data.initiative;

/**
 * @param {Token} token
 * @return {Number}
 */
export const getTokenDisposition = (token) => token.disposition ?? token.data.disposition;

/**
 * @param {Object} dropData
 * @return {Promise<{actor: CairnActor, item: CairnItem}>}
 */
export const getInfoFromDropData = async (dropData) => {
  const itemFromUuid = dropData.uuid ? await fromUuid(dropData.uuid) : null;
  const actor = itemFromUuid
    ? itemFromUuid.actor
    : dropData.sceneId
      ? game.scenes.get(dropData.sceneId).tokens.get(dropData.tokenId).actor
      : game.actors.get(dropData.actorId);

  const item = actor ? (itemFromUuid ? itemFromUuid : actor.items.get(dropData.data._id)) : null;
  return { actor, item };
};
