/**
 * Extend the base Actor entity by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class CairnActor extends Actor {
	/** @override */
	static async create(data, options = {}) {
		if (data.type === "character") {
			mergeObject(data, {
				token: {
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
		const actorData = this.data; // Not sure actorData is to spec.
		const data = actorData.data;
		const flags = actorData.flags;

		// Make separate methods for each Actor type (character, npc, etc.) to keep
		// things organized.
		if (actorData.type === "character") this._prepareCharacterData(actorData);
		if (actorData.type === "npc") this._prepareNpcData(actorData);
		if (actorData.type === "container") this._prepareContainerData(actorData);
	}

	/**
	 * Prepare Character type specific data
	 */
	_prepareCharacterData(actorData) {
		const data = actorData.data;


		data.armor = actorData.items
			.filter((item) => item.type == "armor" || item.type == "item")
			.map((item) => item.data.data.armor * item.data.data.equipped)
			.reduce((a, b) => a + b, 0);

		data.slotsUsed = calcSlotsUsed(this.items);

		data.encumbered = data.slotsUsed >= 10;

		if (data.encumbered) {
			data.hp.value = 0;
		}
		if (data.armor > 3) {
			data.armor = 3;
		}
	}

	_prepareNpcData(actorData) {
		const data = actorData.data;

		let itemArmor = actorData.items
			.filter((item) => item.type == "armor" || item.type == "item")
			.map((item) => item.data.data.armor * item.data.data.equipped)
			.reduce((a, b) => a + b, 0);
		data.armor = Math.max(itemArmor, data.armor);
		if (data.armor > 3) {
			data.armor = 3;
		}
	}

	_prepareContainerData(actorData) {
		const data = actorData.data;
		data.slotsUsed = calcSlotsUsed(this.items);
	}

	/** @override */
	getRollData() {
		const data = super.getRollData();
		// Let us do @str etc, instead of @abilities.str.value
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
		const currentQuantity = item.data.data.quantity;
		if (item) {
			if (currentQuantity > 1) {
				item.update({
					"data.quantity": currentQuantity - 1,
				});
			} else {
				item.delete();
			}
		} else {
			ui.notifications.error(game.i18n.localize("CAIRN.NoItemToDelete"));
		}
	}
}

function calcSlotsUsed(items) {
  return items.reduce((memo, item) => memo + (item.data.data?.bulky ? 2 : item.data.data?.weightless ? 0 : 1), 0);
}
