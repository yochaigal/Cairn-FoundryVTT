import { fields } from '@vttforge/core';
import { itemDataModel } from './base-item-data.mjs';
import { consumableFields, universalFields } from './templates.mjs';

function defineArmorSchema() {
  const f = fields();
  return {
    ...universalFields(f),
    ...consumableFields(f),
    armor: new f.NumberField({ required: true, nullable: false, integer: true, min: 0, initial: 1 }),
  };
}

export class ArmorData extends itemDataModel(defineArmorSchema) {}
