import { fields } from '@vttforge/core';
import { itemDataModel } from './base-item-data.mjs';
import { consumableFields, universalFields, withDamageFields } from './templates.mjs';

function defineWeaponSchema() {
  const f = fields();
  return { ...universalFields(f), ...withDamageFields(f), ...consumableFields(f) };
}

export class WeaponData extends itemDataModel(defineWeaponSchema) {}
