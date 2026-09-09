/**
 * Cairn for Foundry VTT, on the VTTForge SDK.
 *
 * `registerSystem` does what the old `init` hook did by hand: data models,
 * document classes, the initiative formula, and the sheets under keys that
 * survive a rebuild. The derived numbers moved from the Actor class onto
 * the data models, where Foundry runs `prepareDerivedData` for them.
 */
import { registerSystem } from '@vttforge/core';
import { registerHandlebarsHelpers } from './handlebars.mjs';
import { createCharacter } from './character-generator.mjs';
import * as characterGenerator from './character-generator.mjs';
import { CairnCombat } from './combat.mjs';
import { Cairn } from './config.mjs';
import { Damage } from './damage.mjs';
import { CharacterData } from './data/actor/character-data.mjs';
import { ContainerData } from './data/actor/container-data.mjs';
import { NpcData } from './data/actor/npc-data.mjs';
import { ArmorData } from './data/item/armor-data.mjs';
import { ItemData } from './data/item/item-data.mjs';
import { ObjectData } from './data/item/object-data.mjs';
import { SpellbookData } from './data/item/spellbook-data.mjs';
import { WeaponData } from './data/item/weapon-data.mjs';
import { CairnActor } from './documents/actor.mjs';
import { CairnItem } from './documents/item.mjs';
import { createCairnMacro, rollItemMacro } from './macros.mjs';
import { registerSettings, settings, SYSTEM_ID } from './settings.mjs';
import { CharacterSheet, ContainerSheet, NpcSheet } from './sheets/actor-sheet.mjs';
import { CairnItemSheet } from './sheets/item-sheet.mjs';

registerSystem({
  id: SYSTEM_ID,
  actorDataModels: { character: CharacterData, npc: NpcData, container: ContainerData },
  itemDataModels: {
    item: ItemData,
    weapon: WeaponData,
    armor: ArmorData,
    spellbook: SpellbookData,
    object: ObjectData,
  },
  actorDocumentClass: CairnActor,
  itemDocumentClass: CairnItem,
  combat: { initiative: { formula: '1d20' } },

  // Keys are `cairn.<id>`, written down, so the sheet a world picked
  // survives a bundler renaming the class.
  sheets: [
    { id: 'character', document: 'Actor', sheet: CharacterSheet, types: ['character'], makeDefault: true, label: 'CAIRN.Sheet.character' },
    { id: 'npc', document: 'Actor', sheet: NpcSheet, types: ['npc'], makeDefault: true, label: 'CAIRN.Sheet.npc' },
    { id: 'container', document: 'Actor', sheet: ContainerSheet, types: ['container'], makeDefault: true, label: 'CAIRN.Sheet.container' },
    { id: 'item', document: 'Item', sheet: CairnItemSheet, makeDefault: true, label: 'CAIRN.Sheet.item' },
  ],

  onBeforeInit: () => {
    CONFIG.Combat.documentClass = CairnCombat;
    CONFIG.Cairn = Cairn;
    game.cairn = { CairnActor, CairnItem, config: Cairn, characterGenerator, rollItemMacro };
  },

  onAfterInit: () => {
    registerSettings();
    registerHandlebarsHelpers();
    foundry.applications.handlebars.loadTemplates([
      `systems/${SYSTEM_ID}/templates/parts/items-list.hbs`,
      `systems/${SYSTEM_ID}/templates/parts/container-list.hbs`,
      `systems/${SYSTEM_ID}/templates/parts/feature-list.hbs`,
      `systems/${SYSTEM_ID}/templates/parts/editor.hbs`,
    ]);
  },

  onReady: () => {
    Hooks.on('hotbarDrop', (bar, data, slot) => {
      createCairnMacro(data, slot);
      return false;
    });
  },
});

Hooks.on('renderActorDirectory', (app, html) => {
  if (game.user.can('ACTOR_CREATE') && !document.getElementById('cairn-character-gen-button')) {
    const section = document.createElement('header');
    section.classList.add('character-generator', 'directory-header');
    const dirHeader = html.querySelector('.directory-header');
    dirHeader.parentNode.insertBefore(section, dirHeader);
    section.insertAdjacentHTML(
      'afterbegin',
      `<div class="header-actions action-buttons flexrow" id="cairn-character-gen-button">
        <button type="button" class="create-character-generator-button"><i class="fas fa-skull"></i>${game.i18n.localize('CAIRN.CharacterGenerator')}</button>
      </div>`,
    );
    section.querySelector('.create-character-generator-button').addEventListener('click', async () => {
      const actor = await createCharacter();
      actor.sheet.render({ force: true });
    });
  }
  if (!settings.get('show-container-actors')) {
    for (const row of html.querySelectorAll('.actor')) {
      const actor = game.actors.get(row.dataset.entryId);
      row.classList.toggle('hidden', actor?.type === 'container');
    }
  }
});

Hooks.on('renderChatMessageHTML', (message, html, data) => {
  const token = canvas?.scene?.tokens?.get(message.speaker?.token);
  const mayRoll = token !== undefined && (token.actor.testUserPermission(game.user, 'OWNER') || game.user.isGM);
  for (const btn of html.querySelectorAll('.roll-str-save')) {
    if (mayRoll) btn.addEventListener('click', () => Damage._rollStrSave(token, html));
    else btn.style.display = 'none';
  }
  for (const btn of html.querySelectorAll('.apply-dmg')) {
    if (game.user.isGM) btn.addEventListener('click', (ev) => Damage.onClickChatMessageApplyButton(ev, html, data));
    else btn.style.display = 'none';
  }
});
