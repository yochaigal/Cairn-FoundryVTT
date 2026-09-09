/**
 * The three Actor sheets, on `BaseActorSheet` from the SDK.
 *
 * One base carries what the old ActorSheet did with jQuery: item rows with
 * their controls, the expanding descriptions, the dialogs, drag and drop of
 * items and containers. Each type then names its template and its tabs.
 * Every click is a `data-action`; nothing is bound by hand.
 */
import { BaseActorSheet } from '@vttforge/core';
import { regenerateActor } from '../character-generator.mjs';
import { settings, SYSTEM_ID } from '../settings.mjs';
import { evaluateFormula, getInfoFromDropData, stripPar } from '../utils.mjs';

const { DialogV2 } = foundry.applications.api;
const { renderTemplate } = foundry.applications.handlebars;
const TextEditor = foundry.applications.ux.TextEditor.implementation;

/** The row an event landed in, and the id it carries. */
function rowOf(target) {
  const row = target.closest('.cairn-items-list-row');
  return { row, id: row?.dataset.itemId, isContainer: row?.dataset.isContainer === 'true' };
}

class CairnActorSheetBase extends BaseActorSheet() {
  /** @override */
  static DEFAULT_OPTIONS = foundry.utils.mergeObject(
    super.DEFAULT_OPTIONS,
    {
      classes: ['cairn', 'sheet', 'actor'],
      position: { width: 600, height: 750 },
      window: { resizable: true, controls: [] },
      form: { submitOnChange: true },
      actions: {
        itemCreate: CairnActorSheetBase.#onItemCreate,
        containerCreate: CairnActorSheetBase.#onContainerCreate,
        featureCreate: CairnActorSheetBase.#onFeatureCreate,
        featureEdit: CairnActorSheetBase.#onFeatureEdit,
        featureDelete: CairnActorSheetBase.#onFeatureDelete,
        featureToggle: CairnActorSheetBase.#onFeatureToggle,
        addFatigue: CairnActorSheetBase.#onAddFatigue,
        removeFatigue: CairnActorSheetBase.#onRemoveFatigue,
        itemEdit: CairnActorSheetBase.#onItemEdit,
        itemDelete: CairnActorSheetBase.#onItemDelete,
        itemToggle: CairnActorSheetBase.#onItemToggle,
        itemEquip: CairnActorSheetBase.#onItemEquip,
        itemAddUse: CairnActorSheetBase.#onItemAddUse,
        itemRemoveUse: CairnActorSheetBase.#onItemRemoveUse,
        roll: CairnActorSheetBase.#onRoll,
        rollAbility: CairnActorSheetBase.#onRollAbility,
        rest: CairnActorSheetBase.#onRest,
        restoreAbilities: CairnActorSheetBase.#onRestoreAbilities,
        dieOfFate: CairnActorSheetBase.#onDieOfFate,
        setEquipmentLimit: CairnActorSheetBase.#onSetEquipmentLimit,
      },
    },
    { inplace: false },
  );

  /** @override */
  static DRAG_DROP = [{ dragSelector: '.cairn-items-list-row[draggable=true]', dropSelector: null }];

  get actor() {
    return this.document;
  }

  /** @override */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const actor = this.actor;
    const fatigue = game.i18n.localize('CAIRN.Fatigue');
    const items = [...actor.items]
      .sort((a, b) => a.name.localeCompare(b.name))
      .sort((a, b) => Number(b.system.equipped) - Number(a.system.equipped))
      .sort((a, b) => Number(a.name === fatigue) - Number(b.name === fatigue));
    context.actor = actor;
    context.system = actor.system;
    context.items = items;
    context.isEditable = this.isEditable;
    const enrich = (text) => TextEditor.enrichHTML(text ?? '', { relativeTo: actor, secrets: actor.isOwner });
    context.enrichedBiography = await enrich(actor.system.biography);
    context.enrichedDescription = await enrich(actor.system.description);
    context.enrichedNotes = await enrich(actor.system.notes);
    return context;
  }

  /* -------------------------------------------- */
  /*  Drag and drop                               */
  /* -------------------------------------------- */

  /** @override */
  _onDragStart(event) {
    const row = event.currentTarget;
    if ('link' in event.target.dataset) return;
    const id = row.dataset.itemId;
    if (!id) return;
    const doc = row.dataset.isContainer === 'true' ? this.actor.getOwnedContainer(id) : this.actor.items.get(id);
    if (!doc) return;
    event.dataTransfer.setData('text/plain', JSON.stringify(doc.toDragData()));
  }

  /** @override */
  async onDropItem(item, event) {
    if (this.actor.isEncumbered()) {
      ui.notifications.warn(game.i18n.localize('CAIRN.Notify.MaxSlotsOccupied'));
      return false;
    }
    const originalActor = item.actor;
    if (originalActor === this.actor) return false;
    const found = this.actor.items.find((it) => it.name === item.name && it.type === item.type);
    if (found) {
      await found.update({ 'system.quantity': (found.system.quantity ?? 1) + 1 });
    } else {
      const [created] = await this.actor.createEmbeddedDocuments('Item', [item.toObject()]);
      await created?.update({ 'system.quantity': 1 });
    }
    // The item moved, so the source loses one; at zero it goes.
    const left = (item.system.quantity ?? 1) - 1;
    if (originalActor) {
      if (left > 0) await item.update({ 'system.quantity': left });
      else await originalActor.deleteEmbeddedDocuments('Item', [item.id]);
    }
    return true;
  }

  /** @override */
  async onDropActor(actor) {
    if (actor?.type !== 'container') return false;
    if (actor.system.keeper) {
      ui.notifications.warn(game.i18n.localize('CAIRN.ContainerAlreadyOwned'));
      return false;
    }
    if (actor.uuid === this.actor.uuid) return false;
    await this.actor.createOwnedContainer(actor);
    return true;
  }

  /* -------------------------------------------- */
  /*  Rows                                        */
  /* -------------------------------------------- */

  static async #onItemEdit(_event, target) {
    const { id, isContainer } = rowOf(target);
    if (!id) return;
    if (isContainer) {
      this.actor.getOwnedContainer(id)?.sheet.render({ force: true });
      return;
    }
    const item = this.actor.items.get(id);
    if (!item || item.name === game.i18n.localize('CAIRN.Fatigue')) return;
    item.sheet.render({ force: true });
  }

  static async #onItemDelete(_event, target) {
    const { id, isContainer } = rowOf(target);
    if (!id) return;
    if (isContainer) await this.actor.deleteOwnedContainer(id);
    else await this.actor.deleteOwnedItem(id);
  }

  static async #onItemEquip(_event, target) {
    const item = this.actor.items.get(rowOf(target).id);
    if (item) await item.update({ 'system.equipped': !item.system.equipped });
  }

  static async #onItemAddUse(_event, target) {
    const item = this.actor.items.get(rowOf(target).id);
    if (!item) return;
    await item.update({ 'system.uses.value': Math.min(item.system.uses.value + 1, item.system.uses.max) });
  }

  static async #onItemRemoveUse(_event, target) {
    const item = this.actor.items.get(rowOf(target).id);
    if (!item) return;
    let value = Math.max(item.system.uses.value - 1, 0);
    if (value === 0 && item.system.quantity > 1) {
      await item.update({ 'system.quantity': item.system.quantity - 1 });
      value = item.system.uses.max;
    }
    await item.update({ 'system.uses.value': value });
  }

  /** Expand or collapse the description under a row. */
  static async #onItemToggle(event, target) {
    const { row, id, isContainer } = rowOf(target);
    if (!row) return;
    if (event.detail === 2) return CairnActorSheetBase.#onItemEdit.call(this, event, target);
    const open = row.querySelector('.item-description');
    if (open) {
      open.remove();
      row.classList.remove('expanded');
      return;
    }
    let html = '';
    if (isContainer) {
      const container = this.actor.getOwnedContainer(id);
      if (!container) return;
      html = container.items.map((it) => it.name).join(', ');
    } else {
      const item = this.actor.items.get(id);
      if (!item) return;
      html = stripPar(item.system.description ?? '');
      const crit = stripPar(item.system.criticalDamage ?? '');
      if (crit) html += `<div><i class="fa-regular fa-skull"></i> <i>${crit}</i></div>`;
    }
    row.insertAdjacentHTML('beforeend', `<div class="item-description">${html}</div>`);
    row.classList.add('expanded');
  }

  static async #onFeatureToggle(_event, target) {
    const { row, id } = rowOf(target);
    const feature = this.actor.getOwnedFeature(id);
    if (!row || !feature) return;
    const open = row.querySelector('.item-description');
    if (open) {
      open.remove();
      row.classList.remove('expanded');
      return;
    }
    row.insertAdjacentHTML('beforeend', `<div class="item-description">${stripPar(feature.description ?? '')}</div>`);
    row.classList.add('expanded');
  }

  /* -------------------------------------------- */
  /*  Dialogs                                     */
  /* -------------------------------------------- */

  static async #onItemCreate() {
    const content = await renderTemplate(`systems/${SYSTEM_ID}/templates/dialog/add-item-dialog.hbs`);
    await DialogV2.prompt({
      window: { title: game.i18n.localize('CAIRN.CreateItem') },
      content,
      ok: {
        label: game.i18n.localize('CAIRN.CreateItem'),
        callback: (_event, button) => {
          const form = button.form;
          if (form.itemname.value.trim() === '') return;
          this.actor.createOwnedItem({
            name: form.itemname.value,
            type: form.itemtype.value,
            weightless: form.itempetty.checked,
          });
        },
      },
      rejectClose: false,
    });
  }

  static async #onContainerCreate() {
    const content = await renderTemplate(`systems/${SYSTEM_ID}/templates/dialog/add-container-dialog.hbs`);
    await DialogV2.prompt({
      window: { title: game.i18n.localize('CAIRN.CreateContainer') },
      content,
      ok: {
        label: game.i18n.localize('CAIRN.CreateContainer'),
        callback: async (_event, button) => {
          const form = button.form;
          if (form.itemname.value.trim() === '') return;
          const container = await Actor.implementation.create({
            type: 'container',
            name: form.itemname.value,
            system: { slots: { value: form.itemslots.valueAsNumber } },
          });
          await this.actor.createOwnedContainer(container);
        },
      },
      rejectClose: false,
    });
  }

  static async #onFeatureCreate() {
    await this.#featureDialog(undefined);
  }

  static async #onFeatureEdit(_event, target) {
    const feature = this.actor.getOwnedFeature(rowOf(target).id);
    if (feature) await this.#featureDialog(feature);
  }

  static async #onFeatureDelete(_event, target) {
    await this.actor.deleteOwnedFeature(rowOf(target).id);
  }

  async #featureDialog(feature) {
    const content = await renderTemplate(`systems/${SYSTEM_ID}/templates/dialog/add-feature-dialog.hbs`, feature ?? {});
    const editing = feature !== undefined;
    await DialogV2.prompt({
      window: { title: game.i18n.localize(editing ? 'CAIRN.EditFeature' : 'CAIRN.CreateFeature') },
      position: { width: 500 },
      content,
      ok: {
        label: game.i18n.localize(editing ? 'CAIRN.UpdateFeature' : 'CAIRN.CreateFeature'),
        callback: async (_event, button) => {
          const form = button.form;
          if (form.itemname.value.trim() === '') return;
          const data = { name: form.itemname.value, description: form.itemdesc.value };
          for (const flag of ['str', 'dex', 'wil', 'hp', 'armor', 'dmg', 'crit', 'deprived', 'blast']) {
            data[flag] = form[flag].checked;
          }
          if (!editing) {
            await this.actor.createOwnedFeature(data);
            return;
          }
          const features = this.actor.system.features.map((f) => (f.id === feature.id ? { ...f, ...data } : f));
          await this.actor.update({ 'system.features': features });
        },
      },
      rejectClose: false,
    });
  }

  /* -------------------------------------------- */
  /*  Fatigue, rolls, rest                        */
  /* -------------------------------------------- */

  static async #onAddFatigue() {
    if (this.actor.isEncumbered()) {
      ui.notifications.warn(game.i18n.localize('CAIRN.Notify.MaxSlotsOccupied'));
      return;
    }
    await this.actor.createOwnedItem({ name: game.i18n.localize('CAIRN.Fatigue'), type: 'item' });
  }

  static async #onRemoveFatigue() {
    const fatigue = this.actor.items.find((i) => i.name === game.i18n.localize('CAIRN.Fatigue'));
    if (fatigue) await this.actor.deleteOwnedItem(fatigue.id);
  }

  static async #onRoll(_event, target) {
    let formula = target.dataset.roll;
    if (!formula) return;
    let panicLabel = '';
    if (settings.get('use-panic') && this.actor.system.panicked) {
      formula = '1d4';
      panicLabel = `(${game.i18n.localize('CAIRN.RollingWithPanic')})`;
    }
    const roll = await evaluateFormula(formula, this.actor.getRollData());
    const label = target.dataset.label
      ? `${game.i18n.localize('CAIRN.RollingDmgWith')} ${target.dataset.label} ${panicLabel}`
      : '';
    const targets = Array.from(game.user.targets).map((t) => t.id);
    const flavor = await renderTemplate(`systems/${SYSTEM_ID}/templates/chat/dmg-roll-card.hbs`, {
      label,
      targets: targets.length ? targets.join(';') : null,
    });
    await roll.toMessage({ speaker: ChatMessage.getSpeaker({ actor: this.actor }), flavor });
  }

  static async #onRollAbility(_event, target) {
    const formula = target.dataset.roll;
    if (!formula) return;
    const roll = await evaluateFormula(formula, this.actor.getRollData());
    const label = target.dataset.label ? `${game.i18n.localize('CAIRN.Rolling')} ${target.dataset.label}` : '';
    const rolled = roll.terms[0].results[0].result;
    const result = game.i18n.localize(roll.total === 0 ? 'CAIRN.Fail' : 'CAIRN.Success');
    const resultCls = roll.total === 0 ? 'failure' : 'success';
    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: label,
      content: `<div class="dice-roll"><div class="dice-result"><div class="dice-formula">${roll.formula}</div><div class="dice-tooltip" style="display: none;"><section class="tooltip-part"><div class="dice"><header class="part-header flexrow"><span class="part-formula">${roll.formula}</span></header><ol class="dice-rolls"><li class="roll die d20">${rolled}</li></ol></div></section></div><h4 class="dice-total ${resultCls}">${result} (${rolled})</h4></div></div>`,
    });
  }

  static async #onRest() {
    // Someone deprived of a crucial need cannot benefit from a rest.
    if (this.actor.system.deprived) return;
    await this.actor.update({ 'system.hp.value': this.actor.system.hp.max });
  }

  static async #onRestoreAbilities() {
    if (this.actor.system.deprived) return;
    const abilities = this.actor.system.abilities;
    await this.actor.update({
      'system.abilities.STR.value': abilities.STR.max,
      'system.abilities.DEX.value': abilities.DEX.max,
      'system.abilities.WIL.value': abilities.WIL.max,
    });
  }

  static async #onDieOfFate() {
    const roll = await evaluateFormula('1d6');
    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: game.i18n.localize('CAIRN.DieOfFate'),
    });
  }

  static async #onSetEquipmentLimit(event) {
    if (event.detail !== 2 || !settings.get('character-inventory-limit')) return;
    await DialogV2.prompt({
      window: { title: game.i18n.localize('CAIRN.Settings.MaxEquipSlots.label') },
      position: { width: 150 },
      content: `<input name="slots" type="number" autofocus value="${this.actor.system.slotsMax}">`,
      ok: {
        label: game.i18n.localize('CAIRN.SetLimit'),
        callback: (_event, button) => this.actor.update({ 'system.slots': button.form.elements.slots.valueAsNumber }),
      },
      rejectClose: false,
    });
  }
}

export class CharacterSheet extends CairnActorSheetBase {
  /** @override */
  static DEFAULT_OPTIONS = foundry.utils.mergeObject(
    super.DEFAULT_OPTIONS,
    {
      classes: ['character'],
      window: {
        controls: [
          {
            icon: 'fas fa-skull',
            label: 'CAIRN.RegenerateCharacter',
            action: 'regenerate',
            visible: () => settings.get('show-generate-header'),
          },
        ],
      },
      actions: { regenerate: CharacterSheet.#onRegenerate },
    },
    { inplace: false },
  );

  static PARTS = { sheet: { template: `systems/${SYSTEM_ID}/templates/actor/character-sheet.hbs` } };

  static TABS = {
    primary: {
      tabs: [
        { id: 'items', group: 'primary', label: 'CAIRN.Items' },
        { id: 'containers', group: 'primary', label: 'CAIRN.Containers' },
        { id: 'description', group: 'primary', label: 'CAIRN.Description' },
        { id: 'notes', group: 'primary', label: 'CAIRN.Notes' },
      ],
      initial: 'items',
    },
  };

  static async #onRegenerate() {
    const confirmed = await DialogV2.confirm({
      window: { title: game.i18n.localize('CAIRN.CharacterRegeneratorTitle') },
      content: `<p>${game.i18n.localize('CAIRN.CharacterRegeneratorConfirm')}</p>`,
      rejectClose: false,
    });
    if (confirmed) await regenerateActor(this.actor);
  }
}

export class NpcSheet extends CairnActorSheetBase {
  static DEFAULT_OPTIONS = foundry.utils.mergeObject(super.DEFAULT_OPTIONS, { classes: ['npc'] }, { inplace: false });
  static PARTS = { sheet: { template: `systems/${SYSTEM_ID}/templates/actor/npc-sheet.hbs` } };
  static TABS = {
    primary: {
      tabs: [
        { id: 'items', group: 'primary', label: 'CAIRN.Items' },
        { id: 'description', group: 'primary', label: 'CAIRN.Description' },
        { id: 'notes', group: 'primary', label: 'CAIRN.Notes' },
      ],
      initial: 'items',
    },
  };
}

export class ContainerSheet extends CairnActorSheetBase {
  static DEFAULT_OPTIONS = foundry.utils.mergeObject(super.DEFAULT_OPTIONS, { classes: ['container'] }, { inplace: false });
  static PARTS = { sheet: { template: `systems/${SYSTEM_ID}/templates/actor/container-sheet.hbs` } };
  static TABS = {
    primary: {
      tabs: [
        { id: 'items', group: 'primary', label: 'CAIRN.Items' },
        { id: 'description', group: 'primary', label: 'CAIRN.Description' },
      ],
      initial: 'items',
    },
  };
}
