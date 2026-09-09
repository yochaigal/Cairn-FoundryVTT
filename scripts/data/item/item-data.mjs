import { fields } from '@vttforge/core';
import { itemDataModel } from './base-item-data.mjs';
import { consumableFields, universalFields, withDamageFields } from './templates.mjs';

function defineItemSchema() {
  const f = fields();
  return { ...universalFields(f), ...withDamageFields(f), ...consumableFields(f) };
}

export class ItemData extends itemDataModel(defineItemSchema) {}
