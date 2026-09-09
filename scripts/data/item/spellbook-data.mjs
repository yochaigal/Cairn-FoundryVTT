import { fields } from '@vttforge/core';
import { itemDataModel } from './base-item-data.mjs';
import { universalFields } from './templates.mjs';

function defineSpellbookSchema() {
  const f = fields();
  return { ...universalFields(f) };
}

export class SpellbookData extends itemDataModel(defineSpellbookSchema) {}
