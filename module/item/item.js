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
    this.system.isEquipable = ["weapon", "armor", "shield"].includes(this.type);    
    this.system.hasPlusMinus = (this.system.uses?.max ?? 0) > 0;
	}
}
