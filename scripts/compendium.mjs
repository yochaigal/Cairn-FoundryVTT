
/**
 * @param {String} compendiumString
 * @returns {Array.<String>}
 */
export const compendiumInfoFromString = (compendiumString) => compendiumString.split(";");

/**
 * @param {String} compendiumName
 * @param {String} itemName
 * @returns {Promise.<Item|RollTable|undefined>}
 */
export const findCompendiumItem = async (compendiumName, itemName) => {
  const compendium = game.packs.get(compendiumName);
  if (compendium) {
    const documents = await compendium.getDocuments();
    const item = documents.find((i) => i.name === itemName);
    if (!item) {
      console.warn(`findCompendiumItem: Could not find item (${itemName}) in compendium (${compendiumName})`);
    }
    return item;
  }
  console.warn(`findCompendiumItem: Could not find compendium (${compendiumName})`);
};

/**
 * @param {String} compendiumName
 * @param {String} tableName
 * @param {Object} options
 * @returns {Promise.<RollTableDraw>}
 */
export const drawTable = async (compendiumName, tableName, options = {}) => {
  const table = await findCompendiumItem(compendiumName, tableName);
  return table.draw({ displayChat: false, ...options });
};

/**
 * @param {String} compendium
 * @param {String} table
 * @returns {Promise.<String>}
 */
export const drawTableText = async (compendium, table) => (await drawTable(compendium, table)).results[0].getChatText();

/**
 * @param {String} compendium
 * @param {String} table
 * @returns {Promise.<Item[]>}
 */
export const drawTableItem = async (compendium, table) => {
  const draw = await drawTable(compendium, table);
  return findTableItems(draw.results);
};

/**
 * @param {TableResult[]} results
 * @returns {Promise.<Item[]>}
 */
export const findTableItems = async (results) => {
  const items = [];
  let item = null;
  for (const result of results) {
    if (result.type === CONST.TABLE_RESULT_TYPES.COMPENDIUM) {
      item = await findCompendiumItem(result.documentCollection, result.text);
      if (item) {
        items.push(item);
      }
    }
  }
  return items;
};
