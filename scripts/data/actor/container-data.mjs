import { BaseTypeDataModel, fields } from '@vttforge/core';
import { settings } from '../../settings.mjs';
import { liftNumberToValue, valueField } from './templates.mjs';
import { prepareInventory } from './inventory.mjs';

function defineContainerSchema() {
  const f = fields();
  return {
    description: new f.HTMLField({ required: true, blank: true, initial: '' }),
    biography: new f.HTMLField({ required: true, blank: true, initial: '' }),
    slots: valueField(f, 0),
    /** UUID of the character carrying this container, or empty. */
    keeper: new f.StringField({ required: true, blank: true, initial: '' }),
    cost: valueField(f, 0),
    gold: new f.NumberField({ required: true, nullable: false, integer: true, initial: 0 }),
  };
}

export class ContainerData extends BaseTypeDataModel(defineContainerSchema) {
  static migrateData(source, options) {
    liftNumberToValue(source, 'slots');
    liftNumberToValue(source, 'cost');
    return super.migrateData(source, options);
  }

  prepareDerivedData() {
    const actor = this.parent;
    prepareInventory(this, actor);
    this.maybeTooMuchGold = false;
    if (this.keeper) {
      const keeper = game.actors.find((a) => a.uuid === this.keeper);
      if (keeper) this.ownedBy = `${game.i18n.localize('CAIRN.Owner')}: ${keeper.name}`;
    }
    const goldThreshold = settings.get('use-gold-threshold');
    this.hasGoldThreshold = goldThreshold > 0;
    this.goldSlots = this.hasGoldThreshold && this.gold ? Math.ceil(this.gold / goldThreshold) : 0;
    if (this.encumbered && this.hasGoldThreshold && this.goldSlots > 0) this.maybeTooMuchGold = true;
    this.showGoldNotCost = settings.get('show-gold-not-cost');
  }
}
