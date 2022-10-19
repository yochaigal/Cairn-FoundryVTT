// Import Modules
import { CairnActor } from './actor/actor.js'
import { CairnActorSheet } from './actor/actor-sheet.js'
import { CairnItem } from './item/item.js'
import { CairnItemSheet } from './item/item-sheet.js'
import { createCharacter } from './character-generator.js'
import * as characterGenerator from "./character-generator.js";
import { Cairn } from './config.js'
import { CairnCombat } from './combat.js'
import { createCairnMacro, rollItemMacro } from './macros.js'

Hooks.once('init', async function () {
  game.cairn = {
    CairnActor,
    CairnItem,
    config: Cairn,
    characterGenerator: characterGenerator,
    rollItemMacro
  }

  // Define custom Entity classes
  CONFIG.Actor.documentClass = CairnActor;
  CONFIG.Item.documentClass = CairnItem;

  // configure combat
  CONFIG.Combat.documentClass = CairnCombat;
  CONFIG.Combat.initiative = {
    formula: "1d20",
  };

  // Register sheet application classes
  Actors.unregisterSheet('core', ActorSheet);
  Actors.registerSheet('cairn', CairnActorSheet, { makeDefault: true });
  Items.unregisterSheet('core', ItemSheet);
  Items.registerSheet('cairn', CairnItemSheet, { makeDefault: true });

  configureHandleBar();
});

Hooks.once("ready", () => {
  Hooks.on("hotbarDrop", (bar, data, slot) => createCairnMacro(data, slot));
});

Hooks.on("renderActorDirectory", (app, html) => {
  if (game.user.can("ACTOR_CREATE")) {
    const section = document.createElement("header");
    section.classList.add("character-generator");
    section.classList.add("directory-header");

    const dirHeader = html[0].querySelector(".directory-header");
    dirHeader.parentNode.insertBefore(section, dirHeader);
    section.insertAdjacentHTML(
      "afterbegin",
      `
      <div class="header-actions action-buttons flexrow">
        <button class="create-character-generator-button"><i class="fas fa-skull"></i>${game.i18n.localize("CAIRN.CharacterGenerator")}</button>
      </div>
      `
    );
    section.querySelector(".create-character-generator-button").addEventListener("click", async () => {
      const actor = await createCharacter();
      actor.sheet.render(true);
    });
  }
});

const configureHandleBar = () => {
  // Pre-load templates
  const templatePaths = [
    "systems/cairn/templates/parts/items-list.html",
  ];

  loadTemplates(templatePaths);

  // If you need to add Handlebars helpers, here are a few useful examples:
  Handlebars.registerHelper('concat', function () {
    let outStr = '';

    for (const arg in arguments) {
      if (typeof arguments[arg] !== 'object') {
        outStr += arguments[arg];
      }
    }

    return outStr;
  });

  Handlebars.registerHelper('toLowerCase', function (str) {
    return str.toLowerCase();
  });

  Handlebars.registerHelper('boldIf', function (cond, options) {
    return (cond) ? '<strong>' + options.fn(this) + '</strong>' : options.fn(this);
  });

  Handlebars.registerHelper("ifPrint", (cond, v1) => (cond ? v1 : ""));
  Handlebars.registerHelper("ifPrintElse", (cond, v1, v2) => (cond ? v1 : v2));

  Handlebars.registerHelper('times', function(n, block) {
    var accum = '';
    for(var i = 0; i < n; ++i) {
        block.data.index = i;
        block.data.first = i === 0;
        block.data.last = i === (n - 1);
        accum += block.fn(this);
    }
    return accum;
});
}
