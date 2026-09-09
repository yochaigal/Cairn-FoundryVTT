import { fields } from '@vttforge/core';
import { itemDataModel } from './base-item-data.mjs';
import { consumableFields, universalFields } from './templates.mjs';

function defineObjectSchema() {
  const f = fields();
  return { ...universalFields(f), ...consumableFields(f) };
}

export class ObjectData extends itemDataModel(defineObjectSchema) {}
