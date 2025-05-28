/**
 * Extend the base Actor entity by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class CairnActor extends Actor {
  equipContainers = [];

  /** @override */
  static async create(data, options = {}) {
    if (data.type === "character") {
      foundry.utils.mergeObject(
        data,
        {
          prototypeToken: {
            disposition: CONST.TOKEN_DISPOSITIONS.FRIENDLY,
            actorLink: true,
            vision: true,
          },
        },
        { override: false }
      );
    }
    return super.create(data, options);
  }

  /**
   * Augment the basic actor data with additional dynamic data.
   */
  prepareData() {
    super.prepareData();

    this.system.useItemIcons = game.settings.get("cairn", "use-item-icons");
    this.system.showFeatures = game.settings.get("cairn", "show-features-section");
    this.system.showBio = (this.system.biography !== undefined && this.system.biography !== null);
    this.system.showDesc = (this.system.description !== undefined && this.system.description !== null);
    
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
    this.system.slotsMax = this.calcCurrentMaxSlots();
    this.system.encumbered =
      this.system.slotsUsed >= this.calcCurrentMaxSlots();
    this.system.maybeTooMuchGold = false;

    if (!this.system.containers) {
      this.system.containers = [];
    }
    this.system.containerObjects = this.system.containers.map((it) =>
      game.actors.find((a) => a.uuid == it)
    );

    const gct = game.settings.get("cairn", "use-gold-threshold");
    this.system.hasGoldThreshold = gct > 0;
    if (this.system.hasGoldThreshold > 0 && this.system.gold) {
      this.system.goldSlots = Math.floor(this.system.gold / gct);
    }

    if (this.system.encumbered) {
      this.system.hp.value = 0;
      if (this.system.hasGoldThreshold && this.system.goldSlots > 0) {
        this.system.maybeTooMuchGold = true;
      }
    }

    this.system.usePanic = game.settings.get("cairn", "use-panic") > 0;
    if (this.system.usePanic && this.system.panicked) {
      this.system.hp.value = 0;
    }
  }

  _prepareNpcData() {
    this.system.armor = this.calcArmor();
    this.system.slotsUsed = this.calcSlotsUsed();
    this.system.slotsMax = this.calcCurrentMaxSlots();
    this.system.encumbered =
      this.system.slotsUsed >= this.calcCurrentMaxSlots();
  }

  _prepareContainerData() {
    this.system.slotsUsed = this.calcSlotsUsed();
    this.system.slotsMax = this.calcCurrentMaxSlots();
    this.system.encumbered =
      this.system.slotsUsed >= this.calcCurrentMaxSlots();
    if (this.system.keeper && this.system.keeper != "") {
      const actor = game.actors.find((a) => a.uuid == this.system.keeper);
      if (actor) {
        this.system.ownedBy =
          game.i18n.localize("CAIRN.Owner") + ": " + actor.name;
      }
    }
  }

  /** @override */
  getRollData() {
    const data = super.getRollData();
    if (!data.abilities) return data;
    // Let us do @STR etc, instead of @abilities.str.value
    for (const [k, v] of Object.entries(data.abilities)) {
      if (!(k in data)) data[k] = v.value;
    }
    return data;
  }

  getOwnedItem(itemId) {
    return this.getEmbeddedDocument("Item", itemId);
  }

  getOwnedContainer(itemId) {
    return game.actors.find((a) => a.uuid == itemId);
  }

  getOwnedFeature(itemId) {
    if (!this.system.features) return undefined;
    return this.system.features.find(a => a.id == itemId);
  }

  async createOwnedItem(itemData) {
    if (this.isEncumbered() && !itemData.weightless) {
      await ui.notifications.warn(
        game.i18n.localize("CAIRN.Notify.MaxSlotsOccupied")
      );
      return;
    }
    await this.createEmbeddedDocuments("Item", [{...itemData, system: {
      weightless: itemData.weightless
    }}]);
    if (this.type == "container") {
      this._synchronizeKeeperSheet();
    }
  }

  async createOwnedContainer(data) {
    if (!this.system.containers) this.containers = [];
    if (!data || data.type != "container") return;
    if (this.system.containers.find((c) => c.uuid == data.uuid) != undefined)
      return;

    const newValue = this.system.containers;
    newValue.push(data.uuid);
    await this.update({ "system.containers": newValue });
    // update container owner - named 'keeper' to avoid conflict.
    await data.update({ "system.keeper": this.uuid });
  }

  async createOwnedFeature(data) {
    if (!this.system.features) this.system.features = [];
    const newValue = this.system.features;
    data.id = foundry.utils.randomID();
    newValue.push(data);
    await this.update({ "system.features": newValue });
    console.log(data);
  }

  /** No longer an override as deleteOwnedItem is deprecated on type Actor */
  async deleteOwnedItem(itemId) {
    const item = this.items.get(itemId);
    if (item) {
      const proceed = await foundry.applications.api.DialogV2.confirm({
        content:
          game.i18n.localize("CAIRN.Notify.ConfirmDelete") +
          " " +
          item.name +
          "?",
        rejectClose: false,
        modal: true,
      });
      if (!proceed) return;
      await item.delete();
      if (this.type == "container") {
        this._synchronizeKeeperSheet();
      }
    } else {
      await ui.notifications.error(game.i18n.localize("CAIRN.NoItemToDelete"));
    }
  }

  async deleteOwnedContainer(itemId) {
    const container = this.getOwnedContainer(itemId);
    if (!container) return;
    const proceed = await foundry.applications.api.DialogV2.confirm({
      content:
        game.i18n.localize("CAIRN.Notify.ConfirmDelete") +
        " " +
        container.name +
        "?",
      rejectClose: false,
      modal: true,
    });
    if (!proceed) return;
    const containers = this.system.containers.filter((c) => c !== itemId);
    const actor = game.actors.find((a) => a.uuid == itemId);
    await this.update({ "system.containers": containers });
    // update container owner - named 'keeper' to avoid conflict.
    await actor.update({ "system.keeper": "" });
  }

  async deleteOwnedFeature(itemId) {
    const ft = this.getOwnedFeature(itemId);
    if (!ft) return;
    const proceed = await foundry.applications.api.DialogV2.confirm({
      content:
        game.i18n.localize("CAIRN.Notify.ConfirmDelete") +
        " " +
        ft.name +
        "?",
      rejectClose: false,
      modal: true,
    });
    if (!proceed) return;
    const features = this.system.features.filter((c) => c.id !== itemId);
    await this.update({ "system.features": features });
  }

  calcSlotsUsed() {
    let totalSlots = this.items.reduce(
      (memo, item) =>
        memo +
        (item.system.bulky ?? false
          ? item.system.quantity != undefined
            ? 2 * item.system.quantity
            : 2
          : item.system.weightless ?? false
          ? 0
          : item.system.quantity != undefined
          ? item.system.quantity
          : 1),
      0
    );
    const goldThreshold = game.settings.get("cairn", "use-gold-threshold");
    if (goldThreshold > 0 && this.system.gold) {
      totalSlots += Math.floor(this.system.gold / goldThreshold);
    }
    return totalSlots;
  }

  calcArmor() {
    const armor = this.items
      .filter((item) => ["armor", "item"].includes(item.type))
      .filter((item) => item.system.equipped ?? false)
      .map((item) => parseInt(item.system.armor ?? 0, 10))
      .reduce((a, b) => a + b, 0);

    return Math.min(armor, 3);
  }

  calcCurrentMaxSlots() {
    if (
      ["npc", "container"].includes(this.type) &&
      this.system.slots &&
      this.system.slots.value > 0
    )
      return this.system.slots.value;
    return game.settings.get("cairn", "max-equip-slots");
  }

  isEncumbered() {
    return this.system.slotsUsed >= this.calcCurrentMaxSlots();
  }

  _synchronizeKeeperSheet() {
    // Synchronize container owner sheet
    if (this.type !== "container" || this.system.keeper == "") return;
    const keeper = game.actors.find((a) => a.uuid == this.system.keeper);
    if (!keeper) return;
    if (keeper.sheet._state > 0) {
      // sheet visible
      keeper.sheet.render(false);
    }
  }

  /** @override */
  _onUpdate(changed, options, userId) {
    this.system.slotsMax = this.calcCurrentMaxSlots();
    super._onUpdate(changed, options, userId);
    this._synchronizeKeeperSheet();
  }

  /** @override */
  _onDelete(options, userId) {
    const id = this.uuid;
    super._onDelete(options, userId);
    game.actors.forEach(async (ac) => {
      if (ac.type == "character" && ac.system.containers.includes(id)) {
        await ac.update({
          "system.containers": ac.system.containers.filter((it) => it !== id),
        });
        if (ac.sheet._state > 0) {
          // sheet visible
          ac.sheet.render(false);
        }
      }
    });
  }
}
