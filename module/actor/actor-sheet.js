import { regenerateActor } from "../character-generator.js";
import { evaluateFormula, getInfoFromDropData, stripPar } from "../utils.js";

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class CairnActorSheet extends ActorSheet {
  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["cairn", "sheet", "actor"],
      template: "systems/cairn/templates/actor/actor-sheet.html",
      width: 600,
      height: 750,
      tabs: [
        {
          navSelector: ".tabs",
          contentSelector: ".content",
          initial: "items",
        },
      ],
      dragDrop: [{ dragSelector: ".cairn-items-list-row", dropSelector: null }],
    });
  }

  get template() {
    const path = "systems/cairn/templates/actor";
    return `${path}/${this.actor.type}-sheet.html`;
  }

  /** @override */
  async getData() {
    const data = await super.getData();
    data.items = data.items.sort((a, b) =>
      a.name < b.name ? -1 : a.name > b.name ? 1 : 0
    );
    data.items = data.items.sort((a, b) =>
      a.system.equipped && !b.system.equipped
        ? -1
        : a.system.equipped === b.system.equipped
        ? 0
        : 1
    );
    // Compendium monsters have "description" instead of "biography"
    if (this.actor.system.showBio) {
      data.enrichedBiography = await TextEditor.enrichHTML(this.actor.system.biography, { async: true });
    } else {
      data.enrichedDescription = await TextEditor.enrichHTML(this.actor.system.description, { async: true });
    }
    data.enrichedNotes = await TextEditor.enrichHTML(this.actor.system.notes, { async: true });
    
    return data;
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) {
      return;
    }

    // Add inventory item
    html.find(".item-create").click(this._onItemCreate.bind(this));

    // Add inventory container
    html.find(".container-create").click(this._onContainerCreate.bind(this));

    // Add feature
    html.find(".feature-create").click(this._onFeatureCreate.bind(this));

    // Add fatigue
    html.find(".add-fatigue").click(this._onAddFatigue.bind(this));

    // Remove fatigue
    html.find(".remove-fatigue").click(this._onRemoveFatigue.bind(this));

    // Update inventory item
    html.find(".item-edit").click((ev) => {
      const li = $(ev.currentTarget).parents(".cairn-items-list-row");
      if (li.data("isContainer")) {
        const item = this.actor.getOwnedContainer(li.data("itemId"));
        item.sheet.render(true);
        return;
      }
      const item = this.actor.getOwnedItem(li.data("itemId"));
      item.sheet.render(true);
    });

    // Delete inventory item
    html.find(".item-delete").click((ev) => {
      const li = $(ev.currentTarget).parents(".cairn-items-list-row");
      if (li.data("isContainer")) {
        this.actor.deleteOwnedContainer(li.data("itemId"));
      } else {
        this.actor.deleteOwnedItem(li.data("itemId"));
      }
      li.slideUp(200, () => this.render(false));
    });

    // Edit feature
    html.find(".feature-edit").click((ev) => {
      const li = $(ev.currentTarget).parents(".cairn-items-list-row");
      const item = this.actor.getOwnedFeature(li.data("itemId"));
      if (!item) return;
      this._onFeatureEdit(item);
    });

     // Delete feature
     html.find(".feature-delete").click((ev) => {
      const li = $(ev.currentTarget).parents(".cairn-items-list-row");
      this.actor.deleteOwnedFeature(li.data("itemId"));
      li.slideUp(200, () => this.render(false));
    });

    html.find(".item-toggle-equipped").click((ev) => {
      const li = $(ev.currentTarget).parents(".cairn-items-list-row");
      const item = this.actor.getOwnedItem(li.data("itemId"));
      item.update({ "system.equipped": !item.system.equipped });
    });

    // Not exactly quantity, this is about uses
    html.find(".item-add-quantity").click(async (ev) => {
      const li = $(ev.currentTarget).parents(".cairn-items-list-row");
      const item = await this.actor.getOwnedItem(li.data("itemId"));
      await item.update({
          "system.uses.value": Math.min(
            item.system.uses.value + 1,
            item.system.uses.max
          ),
      });      
    });

    html.find(".item-remove-quantity").click(async (ev) => {
      const li = $(ev.currentTarget).parents(".cairn-items-list-row");
      const item = this.actor.getOwnedItem(li.data("itemId"));      
      let val = Math.max(item.system.uses.value - 1, 0)
      if (val == 0 && item.system.quantity > 1) {
        await item.update({
            "system.quantity": item.system.quantity - 1
        });  
        val = item.system.uses.max;
      }
      await item.update({
          "system.uses.value": val,
      });      
    });

    html.find(".roll-control").click(this._onRoll.bind(this));

    // Rollable abilities
    html.find(".resource-roll").click(this._onRollAbility.bind(this));

    // Rest restores HP
    html.find("#rest-button").click(async () => {
      // Someone DEPRIVED of a crucial need (e.g. food,water or warmth) cannot
      // benefit from RESTS
      if (!this.actor.system.deprived) {
        await this.actor.update({
          "system.hp.value": this.actor.system.hp.max,
        });
      }
    });

    html.find("#restore-abilities-button").click(async () => {
      if (!this.actor.system.deprived) {
        await this.actor.update({
          "system.abilities.STR.value": this.actor.system.abilities.STR.max,
        });
        await this.actor.update({
          "system.abilities.DEX.value": this.actor.system.abilities.DEX.max,
        });
        await this.actor.update({
          "system.abilities.WIL.value": this.actor.system.abilities.WIL.max,
        });
      }
    });

    html
      .find(".cairn-item-title")
      .click((event) => this._onItemDescriptionToggle(event));

    html
      .find(".cairn-feature-title")
      .click((event) => this._onFeatureDescriptionToggle(event));      

    html.find("#die-of-fate-button").click(async () => {
      const roll = await evaluateFormula("1d6");
      roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: game.i18n.localize("CAIRN.DieOfFate"),
      });
    });
  }

  /* -------------------------------------------- */
  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  async _onItemCreate(event) {
    event.preventDefault();
    const template = "systems/cairn/templates/dialog/add-item-dialog.html";
    const content = await renderTemplate(template);

    new Dialog({
      title: game.i18n.localize("CAIRN.CreateItem"),
      content,
      buttons: {
        create: {
          icon: '<i class="fas fa-check"></i>',
          label: game.i18n.localize("CAIRN.CreateItem"),
          callback: (html) => {
            const form = html[0].querySelector("form");
            if (form.itemname.value.trim() !== "") {
              this.actor.createOwnedItem({
                name: form.itemname.value,
                type: form.itemtype.value,
                weightless: form.itempetty.checked,
              });
            }
          },
        },
      },
      default: "create",
    }).render(true);
  }

  /* -------------------------------------------- */
  /**
   * Handle creating a new Owned Container for the actor
   * @param {Event} event   The originating click event
   * @private
   */
  async _onContainerCreate(event) {
    event.preventDefault();
    const template = "systems/cairn/templates/dialog/add-container-dialog.html";
    const content = await renderTemplate(template);

    new Dialog({
      title: game.i18n.localize("CAIRN.CreateContainer"),
      content,
      buttons: {
        create: {
          icon: '<i class="fas fa-check"></i>',
          label: game.i18n.localize("CAIRN.CreateContainer"),
          callback: async (html) => {
            const form = html[0].querySelector("form");
            if (form.itemname.value.trim() !== "") {
              const result = await Actor.create({
                type: "container",
                name: form.itemname.value,
                "system.slots.value": form.itemslots.value,
              });
              await this.actor.createOwnedContainer(result);
            }
          },
        },
      },
      default: "create",
    }).render(true);
  }

  /* -------------------------------------------- */
  /**
   * Handle creating a new feature for the actor
   * @param {Event} event   The originating click event
   * @private
   */
  async _onFeatureCreate(event) {
    event.preventDefault();
    const template = "systems/cairn/templates/dialog/add-feature-dialog.html";
    const content = await renderTemplate(template);

    new Dialog({
      title: game.i18n.localize("CAIRN.CreateFeature"),
      content,
      buttons: {
        create: {
          icon: '<i class="fas fa-check"></i>',
          label: game.i18n.localize("CAIRN.CreateFeature"),
          callback: async (html) => {
            const form = html[0].querySelector("form");
            if (form.itemname.value.trim() !== "") {
              const data = {
                "name": form.itemname.value,
                "description": form.itemdesc.value,
              };
              const checks = ['str','dex','wil','hp','armor','dmg','crit','deprived','blast'];
              checks.forEach((c) => {
                data[c] = form[c].checked;
              });
              await this.actor.createOwnedFeature(data);
            }
          },
        },
      },
      default: "create",
    },{
      "width": 500,
    }).render(true);
  }

  async _onFeatureEdit(item) {
    const template = "systems/cairn/templates/dialog/add-feature-dialog.html";
    const content = await renderTemplate(template, item);
    
    new Dialog({
      title: game.i18n.localize("CAIRN.EditFeature"),
      content,
      buttons: {
        update: {
          icon: '<i class="fas fa-check"></i>',
          label: game.i18n.localize("CAIRN.UpdateFeature"),
          callback: async (html) => {
            const form = html[0].querySelector("form");
            if (form.itemname.value.trim() !== "") {
              const newItem = item;
              newItem.name  = form.itemname.value;
              newItem.description = form.itemdesc.value;
              const checks = ['str','dex','wil','hp','armor','dmg','crit','deprived','blast'];
              checks.forEach((c) => {
                newItem[c] = form[c].checked;
              });
              const features = this.actor.system.features.filter((f) => f.id != newItem.id);
              features.push(newItem);
              await this.actor.update({"system.features":features});
            }
          },
        },
      },
      default: "update",
    },{
      "width": 500,
    }).render(true);
  }

  /**
   * Handle creating a fatigue for the actor
   * @param {Event} event   The originating click event
   * @private
   */
  async _onAddFatigue(event) {
    event.preventDefault();
    if (this.actor.isEncumbered()) {
      ui.notifications.warn(
        game.i18n.localize("CAIRN.Notify.MaxSlotsOccupied")
      );
      return;
    }

    this.actor.createOwnedItem({
      name: game.i18n.localize("CAIRN.Fatigue"),
      type: "item",
    });
  }

  /**
   * Handle removing any fatigue for the actor
   * @param {Event} event   The originating click event
   * @private
   */
  async _onRemoveFatigue(event) {
    event.preventDefault();

    // Find a fatigue to delete
    const fatigues = this.actor.items.filter(
      (i) => i.name === game.i18n.localize("CAIRN.Fatigue")
    );

    if (fatigues.length > 0) {
      const fatigue = fatigues[0];
      this.actor.deleteOwnedItem(fatigue._id);
    }
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  async _onRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;
    if (dataset.roll) {
      const usePanic = game.settings.get("cairn", "use-panic");
      let panicLabel = "";
      if (usePanic && this.actor.system.panicked) {
        dataset.roll = "1d4"; // panicked character
        panicLabel = "(" + game.i18n.localize("CAIRN.RollingWithPanic") + ")";
      }

      const roll = await evaluateFormula(
        dataset.roll,
        this.actor.getRollData()
      );
      const label = dataset.label
        ? game.i18n.localize("CAIRN.RollingDmgWith") +
          ` ${dataset.label} ` +
          panicLabel
        : "";

      const targetedTokens = Array.from(game.user.targets).map((t) => t.id);

      let targetIds;
      if (targetedTokens.length == 0) targetIds = null;
      else if (targetedTokens.length == 1) targetIds = targetedTokens[0];
      else {
        targetIds = targetedTokens[0];
        for (let index = 1; index < targetedTokens.length; index++) {
          const element = targetedTokens[index];
          targetIds = targetIds.concat(";", element);
        }
      }

      this._buildDamageRollMessage(label, targetIds).then((msg) => {
        roll.toMessage({
          speaker: ChatMessage.getSpeaker({ actor: this.actor }),
          flavor: msg,
        });
      });
    }
  }

  _buildDamageRollMessage(label, targetIds) {
    const rollMessageTpl = "systems/cairn/templates/chat/dmg-roll-card.html";
    const tplData = { label: label, targets: targetIds };
    return renderTemplate(rollMessageTpl, tplData);
  }

  _onItemDescriptionToggle(event) {
    event.preventDefault();
    const boxItem = $(event.currentTarget).parents(".cairn-items-list-row");
    const isContainer = boxItem.data("isContainer");
    if (isContainer) {
      this._prepareContainerDescription(boxItem);
      return;
    }
    this._prepareItemDescription(boxItem);
  }

  _prepareContainerDescription(boxItem) {
    if (boxItem.hasClass("expanded")) {
      const summary = boxItem.children(".item-description");
      summary.slideUp(200, () => summary.remove());
    } else {
      const id = boxItem.data("itemId");
      const item = game.actors.find((a) => a.uuid == id);
      if (!item) return;
      let list = item.items.map((it) => it.name);
      const div = $(`<div class="item-description">${list.join(", ")}</div>`);
      boxItem.append(div.hide());
      div.slideDown(200);
    }
    boxItem.toggleClass("expanded");
  }

  _prepareItemDescription(boxItem) {
    const item = this.actor.items.get(boxItem.data("itemId"));
    if (boxItem.hasClass("expanded")) {
      const summary = boxItem.children(".item-description");
      summary.slideUp(200, () => summary.remove());
    } else {
      const desc = stripPar(item.system.description);
      let crit = "";
      if (
        item.system.criticalDamage &&
        stripPar(item.system.criticalDamage) !== ""
      )
        crit =
          '<div><i class="fa-regular fa-skull"></i> <i>'+
          stripPar(item.system.criticalDamage) +
          "</i></div>";
      const div = $(`<div class="item-description">${desc}${crit}</div>`);
      boxItem.append(div.hide());
      div.slideDown(200);
    }
    boxItem.toggleClass("expanded");
  }

  _onFeatureDescriptionToggle(event) {
    event.preventDefault();
    const boxItem = $(event.currentTarget).parents(".cairn-items-list-row");
    const item = this.actor.getOwnedFeature(boxItem.data("itemId"));
    if (!item) return;
    if (boxItem.hasClass("expanded")) {
      const summary = boxItem.children(".item-description");
      summary.slideUp(200, () => summary.remove());
    } else {
      const desc = stripPar(item.description);
      const div = $(`<div class="item-description">${desc}</div>`);
      boxItem.append(div.hide());
      div.slideDown(200);
    }
    boxItem.toggleClass("expanded");
  }


  async _onRollAbility(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;
    if (dataset.roll) {
      const roll = await evaluateFormula(
        dataset.roll,
        this.actor.getRollData()
      );
      const label = dataset.label
        ? game.i18n.localize("CAIRN.Rolling") + ` ${dataset.label}`
        : "";
      const rolled = roll.terms[0].results[0].result;
      const result =
        roll.total === 0
          ? game.i18n.localize("CAIRN.Fail")
          : game.i18n.localize("CAIRN.Success");
      const resultCls = roll.total === 0 ? "failure" : "success";
      roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: label,
        content: `<div class="dice-roll"><div class="dice-result"><div class="dice-formula">${roll.formula}</div><div class="dice-tooltip" style="display: none;"><section class="tooltip-part"><div class="dice"><header class="part-header flexrow"><span class="part-formula">${roll.formula}</span></header><ol class="dice-rolls"><li class="roll die d20">${rolled}</li></ol></div></section></div><h4 class="dice-total ${resultCls}">${result} (${rolled})</h4</div></div>`,
      });
    }
  }

  /**
   * @param {MouseEvent} event
   * @private
   */
  async _onRegenerateCharacter(event) {
    event.preventDefault();

    const confirm = await Dialog.confirm({
      title: game.i18n.localize("CAIRN.CharacterRegeneratorTitle"),
      content: `<p>${game.i18n.localize(
        "CAIRN.CharacterRegeneratorConfirm"
      )}</p>`,
      defaultYes: false,
    });

    if (confirm) {
      await regenerateActor(this.actor);
    }
  }

  /** @override */
  _getHeaderButtons() {
    const showGenHeader = game.settings.get("cairn", "show-generate-header");
    if (this.actor.type === "character" && showGenHeader) {
      return [
        {
          class: `regenerate-character-button-${this.actor.id}`,
          label: game.i18n.localize("CAIRN.RegenerateCharacter"),
          icon: "fas fa-skull",
          onclick: this._onRegenerateCharacter.bind(this),
        },
        ...super._getHeaderButtons(),
      ];
    } else {
      return super._getHeaderButtons();
    }
  }

  /**
   * @override
   *
   * @param {DragEvent} event
   * @param {Object} itemData
   */
  async _onDropItem(event, itemData) {
    if (this.actor.isEncumbered()) {
      ui.notifications.warn(
        game.i18n.localize("CAIRN.Notify.MaxSlotsOccupied")
      );
      return;
    }

    const { item: originalItem, actor: originalActor } =
      await getInfoFromDropData(itemData);
    if (originalItem == undefined || originalItem == null) {
      return;
    }
    if (this.actor == originalActor) return;

    // Check if we already have such item
    const foundItem = this.actor.items.find(
      (it) => it.name == originalItem.name && it.type == originalItem.type
    );
    if (foundItem != undefined && foundItem != null) {
      foundItem.system.quantity += 1;
      await foundItem.update({ "system.quantity": foundItem.system.quantity });
    } else {
      const item = ((await super._onDropItem(event, itemData)) || []).pop();
      await item.update({ "system.quantity": 1 });
    }
    if (originalItem.system.quantity === undefined) {
      originalItem.system.quantity = 1;
    }
    let osq = originalItem.system.quantity;
    osq -= 1;
    if (osq > 0) {
      // cannot update with 0
      await originalItem.update({
        "system.quantity": osq,
      });
    } else {
      if (originalActor != undefined)
        await originalActor.deleteEmbeddedDocuments("Item", [originalItem.id]);
    }
  }

  /**
   * @override
   *
   * @param {DragEvent} event
   * @param {Object} itemData
   */
  async _onDropActor(event, data) {
    let actor = game.actors.find((a) => a.uuid == data.uuid);
    if (actor.type !== "container") return;
    if (actor.system.keeper != "") {
      ui.notifications.warn(game.i18n.localize("CAIRN.ContainerAlreadyOwned"));
      return;
    }
    if (this.actor.uuid == data.uuid) return;
    await this.actor.createOwnedContainer(actor);
  }
}
