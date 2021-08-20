/**
 * Extend the base Actor entity by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class CairnActor extends Actor {
  /**
     * Augment the basic actor data with additional dynamic data.
     */
  prepareData () {
    super.prepareData()

    const actorData = this.data
    const data = actorData.data
    const flags = actorData.flags

    // Make separate methods for each Actor type (character, npc, etc.) to keep
    // things organized.
    if (actorData.type === 'character') this._prepareCharacterData(actorData)
    if (actorData.type === 'npc') this._prepareNpcData(actorData)
    if (actorData.type === 'container') this._prepareContainerData(actorData)
  }

  /**
     * Prepare Character type specific data
     */
  _prepareCharacterData (actorData) {
    const data = actorData.data

    data.armor = actorData
      .items
      .filter(item => item.type == 'armor' || item.type == 'item')
      .map(item => item.data.data.armor * item.data.data.equipped)
      .reduce((a, b) => a + b, 0)

    data.slotsUsed = calcSlotsUsed(actorData)

    data.encumbered = data.slotsUsed >= 10

    if (data.encumbered) {
      data.hp.value = 0
    }
  }

  _prepareNpcData (actorData) {
    const data = actorData.data

    let itemArmor = actorData
      .items
      .filter(item => item.type == 'armor' || item.type == 'item')
      .map(item => item.data.data.armor * item.data.data.equipped)
      .reduce((a, b) => a + b, 0)

    data.armor = Math.max(itemArmor, data.armor)
  }

  _prepareContainerData (actorData) {
    const data = actorData.data

    data.slotsUsed = calcSlotsUsed(actorData)
  }

  /** @override */
  getRollData () {
    const data = super.getRollData()
    // Let us do @str etc, instead of @abilities.str.value
    for (const [k, v] of Object.entries(data.abilities)) {
      if (!(k in data)) data[k] = v.value
    }
    return data
  }

  /** @override */
  deleteOwnedItem (itemId) {
    const item = this.getOwnedItem(itemId)
    if (item.data.data.quantity > 1) {
      item.data.data.quantity--
    } else {
      super.deleteOwnedItem(itemId)
    }
  }
}

function calcSlotsUsed(actorData) {
  return actorData
    .items
    .map(item => item.data.data.slots * (item.data.data.quantity || 1))
    .reduce((memo, slots) => memo + slots, 0)
}

