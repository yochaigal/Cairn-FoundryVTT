/**
 * Extend the base Actor entity by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class SabActor extends Actor {
	/** @override */
	static async create(data, options = {}) {
		if (data.type === "character") {
			mergeObject(data, {
				prototypeToken: {
					disposition: CONST.TOKEN_DISPOSITIONS.FRIENDLY,
					actorLink: true,
					vision: true,
				}
			}, {override: false});
		}
		return super.create(data, options);
	}

	/**
	 * Augment the basic actor data with additional dynamic data.
	 */
	prepareData() {
		super.prepareData();
    
		if (this.type === "character") this._prepareCharacterData();
		if (this.type === "npc") this._prepareNpcData();
		if (this.type === "container") this._prepareContainerData();
	}

	/**
	 * Prepare Character type specific data
	 */
	_prepareCharacterData() {
    this.system.armor = this.calcArmor();
    this.system.slotsUsed = this.calcSlotsUsed();
    this.system.encumbered = this.system.slotsUsed >= 10;

		if (this.system.encumbered) {
			this.system.hp.value = 0;
		}
	}

	_prepareNpcData() {
    this.system.armor = this.calcArmor();
	}

	_prepareContainerData() {
		this.system.slotsUsed = this.calcSlotsUsed();
	}

	/** @override */
	getRollData() {
		const data = super.getRollData();
		// Let us do @STR etc, instead of @abilities.str.value
		for (const [k, v] of Object.entries(data.abilities)) {
			if (!(k in data)) data[k] = v.value;
		}
		return data;
	}

	getOwnedItem(itemId) {
		return this.getEmbeddedDocument("Item", itemId);
	}

	createOwnedItem(itemData) {
		this.createEmbeddedDocuments("Item", [itemData]);
	}

	/** No longer an override as deleteOwnedItem is deprecated on type Actor */
	deleteOwnedItem(itemId) {
		const item = this.items.get(itemId);
		const currentQuantity = item.system.quantity;
		if (item) {
				item.delete();
		} else {
			ui.notifications.error(game.i18n.localize("SAB.NoItemToDelete"));
		}
	}

  calcSlotsUsed() {
    return this.items.reduce((memo, item) => memo + ((item.system.bulky ?? false) ? 2 : (item.system.weightless ?? false) ? 0 : 1), 0);
  }

  calcArmor() {
    const armor = this.items
			.filter((item) => ["armor", "item"].includes(item.type))
      .filter((item) => item.system.equipped ?? false)
			.map((item) => parseInt(item.system.armor ?? 0, 10))
			.reduce((a, b) => a + b, 0);

    return Math.min(armor, 3);
  }
}
