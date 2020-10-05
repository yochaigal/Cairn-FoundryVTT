/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class ElectricBastionlandActorSheet extends ActorSheet {
    /** @override */
    static get defaultOptions () {
        return mergeObject(super.defaultOptions, {
            classes: ["electricbastionland",
                "sheet",
                "actor"],
            template: "systems/electricbastionland/templates/actor/actor-sheet.html",
            width: 500,
            height: 600,
            tabs: [
                {
                    navSelector: ".sheet-tabs",
                    contentSelector: ".sheet-body",
                    initial: "description",
                },
            ],
        });
    }

    /* -------------------------------------------- */

    /** @override */
    getData () {
        return super.getData();
    }

    /** @override */
    activateListeners (html) {
        super.activateListeners(html);

        // Everything below here is only needed if the sheet is editable
        if (!this.options.editable) {
            return;
        }

        // Add Inventory Item
        html.find('.item-create')
            .click(this._onItemCreate.bind(this));

        // Update Inventory Item
        html.find('.item-edit')
            .click(ev => {
                const li = $(ev.currentTarget).parents(".item");
                const item = this.actor.getOwnedItem(li.data("itemId"));
                item.sheet.render(true);
            });

        // Delete Inventory Item
        html.find('.item-delete')
            .click(ev => {
                const li = $(ev.currentTarget).parents(".item");
                this.actor.deleteOwnedItem(li.data("itemId"));
                li.slideUp(200, () => this.render(false));
            });

        // Rollable abilities.
        html.find('.rollable')
            .click(this._onRoll.bind(this));

        // Rest restores HP
        html.find('.rest')
            .click(async ev => {
                // Someone DEPRIVED of a crucial need (e.g.
                // food,water or warmth) cannot benefit from RESTS
                console.log('Rest');
                if (!this.actor.data.data.deprived) {
                    await this.actor.update({'data.hp.value': this.actor.data.data.hp.max});
                }
            });

        html.find('.restore')
            .click(async ev => {
                await this.actor.update({'data.abilities.STR.value': this.actor.data.data.abilities.STR.max});
                await this.actor.update({'data.abilities.DEX.value': this.actor.data.data.abilities.DEX.max});
                await this.actor.update({'data.abilities.CHA.value': this.actor.data.data.abilities.CHA.max});
            });

        html.find('.luck')
            .click(ev => {
                let roll = new Roll("1d6");
                roll.roll();
            });
    }

    /* -------------------------------------------- */

    /**
     * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
     * @param {Event} event   The originating click event
     * @private
     */
    _onItemCreate (event) {
        event.preventDefault();
        const header = event.currentTarget;
        // Get the type of item to create.
        const type = header.dataset.type;
        // Grab any data associated with this control.
        const data = duplicate(header.dataset);
        // Initialize a default name.
        const name = `New ${type.capitalize()}`;
        // Prepare the item object.
        const itemData = {
            name: name,
            type: type,
            data: data,
        };
        // Remove the type from the dataset since it's in the itemData.type prop.
        delete itemData.data["type"];

        // Finally, create the item!
        return this.actor.createOwnedItem(itemData);
    }

    /**
     * Handle clickable rolls.
     * @param {Event} event   The originating click event
     * @private
     */
    _onRoll (event) {
        event.preventDefault();
        const element = event.currentTarget;
        const dataset = element.dataset;

        if (dataset.roll) {
            let roll = new Roll(dataset.roll, this.actor.data.data);
            let label = dataset.label ? `Rolling ${dataset.label}` : '';

            roll.roll().toMessage({
                speaker: ChatMessage.getSpeaker({actor: this.actor}),
                flavor: label,
            });
        }
    }

}
