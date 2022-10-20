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
  const fmt = /\{[^}]+\}/g;
  str = str.replace(fmt, k => {
    return data[k.slice(1, -1)];
  });
  return str;
}

/* V10/V9 compatibility */
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
