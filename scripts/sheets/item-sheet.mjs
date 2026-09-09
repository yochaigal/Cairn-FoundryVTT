/**
 * One Item sheet for the five types, on `BaseItemSheet` from the SDK. The
 * template is picked per type when the parts are configured, which is what
 * the old `get template()` did.
 */
import { BaseItemSheet } from '@vttforge/core';
import { SYSTEM_ID } from '../settings.mjs';

const TextEditor = foundry.applications.ux.TextEditor.implementation;

export class CairnItemSheet extends BaseItemSheet() {
  /** @override */
  static DEFAULT_OPTIONS = foundry.utils.mergeObject(
    super.DEFAULT_OPTIONS,
    {
      classes: ['cairn', 'sheet', 'item'],
      position: { width: 480, height: 480 },
      window: { resizable: true },
      form: { submitOnChange: true },
      actions: { exclusiveFlag: CairnItemSheet.#onExclusiveFlag },
    },
    { inplace: false },
  );

  static PARTS = { sheet: { template: `systems/${SYSTEM_ID}/templates/item/item-sheet.hbs` } };

  static TABS = {
    primary: {
      tabs: [
        { id: 'description', group: 'primary', label: 'CAIRN.Description' },
        { id: 'crit-dmg', group: 'primary', label: 'CAIRN.CriticalDamage' },
      ],
      initial: 'description',
    },
  };

  get item() {
    return this.document;
  }

  /** @override */
  _configureRenderParts(options) {
    const parts = super._configureRenderParts(options);
    parts.sheet = { ...parts.sheet, template: `systems/${SYSTEM_ID}/templates/item/${this.item.type}-sheet.hbs` };
    return parts;
  }

  /** @override */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const item = this.item;
    context.item = item;
    context.system = item.system;
    context.isEditable = this.isEditable;
    const enrich = (text) => TextEditor.enrichHTML(text ?? '', { relativeTo: item, secrets: item.isOwner });
    context.enrichedDescription = await enrich(item.system.description);
    context.enrichedCriticalDamage = await enrich(item.system.criticalDamage);
    return context;
  }

  /** Bulky and weightless exclude each other: ticking one clears the other. */
  static async #onExclusiveFlag(_event, target) {
    if (!target.checked) return;
    const other = target.name === 'system.bulky' ? 'system.weightless' : 'system.bulky';
    await this.item.update({ [target.name]: true, [other]: false });
  }
}
