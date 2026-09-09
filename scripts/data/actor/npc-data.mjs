import { BaseTypeDataModel, fields } from '@vttforge/core';
import { actorBaseFields, featureField, liftNumberToValue, valueField } from './templates.mjs';
import { prepareInventory } from './inventory.mjs';

function defineNpcSchema() {
  const f = fields();
  return {
    ...actorBaseFields(f),
    background: new f.StringField({ required: true, blank: true, initial: '' }),
    description: new f.HTMLField({ required: true, blank: true, initial: '' }),
    notes: new f.HTMLField({ required: true, blank: true, initial: '' }),
    gold: new f.NumberField({ required: true, nullable: false, integer: true, initial: 0 }),
    armor: new f.NumberField({ required: true, nullable: false, integer: true, initial: 0 }),
    slots: valueField(f, 0),
    features: new f.ArrayField(featureField(f)),
  };
}

export class NpcData extends BaseTypeDataModel(defineNpcSchema) {
  static migrateData(source, options) {
    liftNumberToValue(source, 'slots');
    return super.migrateData(source, options);
  }

  prepareDerivedData() {
    prepareInventory(this, this.parent);
    this.showBio = false;
    this.showDesc = true;
  }
}
