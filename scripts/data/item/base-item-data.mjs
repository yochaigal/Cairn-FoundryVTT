import { BaseTypeDataModel } from '@vttforge/core';
import { settings } from '../../settings.mjs';
import { liftCost } from './templates.mjs';

const ICONS = { spellbook: 'book', weapon: 'sword', armor: 'shield' };

/** What every Cairn item derives, whatever its type. */
export function itemDataModel(defineSchema) {
  return class extends BaseTypeDataModel(defineSchema) {
    static migrateData(source, options) {
      liftCost(source);
      return super.migrateData(source, options);
    }

    prepareDerivedData() {
      const item = this.parent;
      const actorType = item.actor?.type ?? '';
      this.isEquipable = ['weapon', 'armor', 'spellbook'].includes(item.type) && actorType !== 'container';
      this.hasPlusMinus = (this.uses?.max ?? 0) > 0;
      if (this.uses && this.uses.value > this.uses.max) this.uses.value = this.uses.max;
      this.isFatigue = item.name === game.i18n.localize('CAIRN.Fatigue');
      this.useItemIcons = settings.get('use-item-icons');
      this.icon = this.useItemIcons ? (ICONS[item.type] ?? (this.isFatigue ? 'weight-hanging' : '')) : '';
    }
  };
}
