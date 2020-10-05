// Import Modules
import { ElectricBastionlandActor } from "./actor/actor.js";
import { ElectricBastionlandActorSheet } from "./actor/actor-sheet.js";
import { ElectricBastionlandItem } from "./item/item.js";
import { ElectricBastionlandItemSheet } from "./item/item-sheet.js";

Hooks.once('init', async function () {

    game.electricbastionland = {
        ElectricBastionlandActor,
        ElectricBastionlandItem,
    };

    // Define custom Entity classes
    CONFIG.Actor.entityClass = ElectricBastionlandActor;
    CONFIG.Item.entityClass = ElectricBastionlandItem;

    // Register sheet application classes
    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("electricbastionland", ElectricBastionlandActorSheet, {makeDefault: true});
    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("electricbastionland", ElectricBastionlandItemSheet, {makeDefault: true});

    // If you need to add Handlebars helpers, here are a few useful examples:
    Handlebars.registerHelper('concat', function () {
        let outStr = '';

        for (var arg in arguments) {
            if (typeof arguments[arg] != 'object') {
                outStr += arguments[arg];
            }
        }
        
        return outStr;
    });

    Handlebars.registerHelper('toLowerCase', function (str) {
        return str.toLowerCase();
    });

    Handlebars.registerHelper('boldIf', function (cond, options) {
        return (cond) ? '<b>' + options.fn(this) + '</b>' : options.fn(this);
    });

});

