import { settings } from '../settings.mjs';

const { DialogV2 } = foundry.applications.api;

/** Cairn's Actor: the behaviour. The derived numbers live on the data models. */
export class CairnActor extends Actor {
  /** @override */
  static async create(data, options = {}) {
    if (data.type === 'character') {
      foundry.utils.mergeObject(
        data,
        { prototypeToken: { disposition: CONST.TOKEN_DISPOSITIONS.FRIENDLY, actorLink: true, sight: { enabled: true } } },
        { overwrite: false },
      );
    }
    return super.create(data, options);
  }

  /** @override */
  getRollData() {
    const data = super.getRollData();
    if (!data.abilities) return data;
    // `@STR` reads better in a formula than `@abilities.STR.value`.
    for (const [key, ability] of Object.entries(data.abilities)) {
      if (!(key in data)) data[key] = ability.value;
    }
    return data;
  }

  getOwnedItem(itemId) {
    return this.getEmbeddedDocument('Item', itemId);
  }

  getOwnedContainer(uuid) {
    return game.actors.find((a) => a.uuid === uuid);
  }

  getOwnedFeature(id) {
    return this.system.features?.find((f) => f.id === id);
  }

  isEncumbered() {
    return this.system.slotsUsed >= this.system.slotsMax;
  }

  calcCurrentMaxSlots() {
    return this.system.slotsMax;
  }

  async createOwnedItem(itemData) {
    if (this.isEncumbered() && !itemData.weightless) {
      ui.notifications.warn(game.i18n.localize('CAIRN.Notify.MaxSlotsOccupied'));
      return;
    }
    await this.createEmbeddedDocuments('Item', [
      { ...itemData, system: { weightless: Boolean(itemData.weightless) } },
    ]);
    if (this.type === 'container') this._synchronizeKeeperSheet();
  }

  async createOwnedContainer(container) {
    if (!container || container.type !== 'container') return;
    if (this.system.containers.includes(container.uuid)) return;
    await this.update({ 'system.containers': [...this.system.containers, container.uuid] });
    // The container points back at its carrier; "keeper" so the key does not clash with `owner`.
    await container.update({ 'system.keeper': this.uuid });
  }

  async createOwnedFeature(data) {
    const feature = { ...data, id: foundry.utils.randomID() };
    await this.update({ 'system.features': [...this.system.features, feature] });
  }

  async deleteOwnedItem(itemId) {
    const item = this.items.get(itemId);
    if (!item) {
      ui.notifications.error(game.i18n.localize('CAIRN.NoItemToDelete'));
      return;
    }
    const proceed = await DialogV2.confirm({
      content: `${game.i18n.localize('CAIRN.Notify.ConfirmDelete')} ${item.name}?`,
      rejectClose: false,
      modal: true,
    });
    if (!proceed) return;
    await item.delete();
    if (this.type === 'container') this._synchronizeKeeperSheet();
  }

  async deleteOwnedContainer(uuid) {
    const container = this.getOwnedContainer(uuid);
    if (!container) return;
    const proceed = await DialogV2.confirm({
      content: `${game.i18n.localize('CAIRN.Notify.ConfirmDelete')} ${container.name}?`,
      rejectClose: false,
      modal: true,
    });
    if (!proceed) return;
    await this.update({ 'system.containers': this.system.containers.filter((c) => c !== uuid) });
    await container.update({ 'system.keeper': '' });
  }

  async deleteOwnedFeature(id) {
    const feature = this.getOwnedFeature(id);
    if (!feature) return;
    const proceed = await DialogV2.confirm({
      content: `${game.i18n.localize('CAIRN.Notify.ConfirmDelete')} ${feature.name}?`,
      rejectClose: false,
      modal: true,
    });
    if (!proceed) return;
    await this.update({ 'system.features': this.system.features.filter((f) => f.id !== id) });
  }

  /** A container's carrier shows the container's contents; keep that sheet current. */
  _synchronizeKeeperSheet() {
    if (this.type !== 'container' || !this.system.keeper) return;
    const keeper = game.actors.find((a) => a.uuid === this.system.keeper);
    if (keeper?.sheet?.rendered) keeper.sheet.render();
  }

  /** @override */
  _onUpdate(changed, options, userId) {
    super._onUpdate(changed, options, userId);
    this._synchronizeKeeperSheet();
  }

  /** @override */
  _onDelete(options, userId) {
    const uuid = this.uuid;
    super._onDelete(options, userId);
    for (const actor of game.actors) {
      if (actor.type === 'character' && actor.system.containers.includes(uuid)) {
        void actor.update({ 'system.containers': actor.system.containers.filter((c) => c !== uuid) });
      }
    }
  }
}

/** Whether the world lets a character set its own slot limit. */
export function characterSlotLimitEnabled() {
  return settings.get('character-inventory-limit');
}
