/**
 * Extend the basic Item with some very simple modifications.
 * @extends {Item}
 */
export class CairnItem extends Item {
  /**
   * Augment the basic item data with additional dynamic data.
   */
  prepareData() {
    super.prepareData();
    // Items in containers cannot be equippable.
    const actorType = this.actor ? this.actor.type : "";
    this.system.isEquipable =
      ["weapon", "armor", "spellbook"].includes(this.type) &&
      actorType != "container";
    this.system.hasPlusMinus = (this.system.uses?.max ?? 0) > 0;
    if (this.system.uses.value > this.system.uses.max)
      this.system.uses.value = this.system.uses.max;
  }
}
