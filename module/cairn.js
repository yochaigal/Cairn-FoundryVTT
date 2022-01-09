// Import Modules
import { CairnActor } from './actor/actor.js'
import { CairnActorSheet } from './actor/actor-sheet.js'
import { CairnItem } from './item/item.js'
import { CairnItemSheet } from './item/item-sheet.js'

Hooks.once('init', async function () {
  game.cairn = {
    CairnActor,
    CairnItem
  }

  // Define custom Entity classes
  CONFIG.Actor.documentClass = CairnActor;
  CONFIG.Item.entityClass = CairnItem

  // Register sheet application classes
  Actors.unregisterSheet('core', ActorSheet)
  Actors.registerSheet('cairn', CairnActorSheet, { makeDefault: true })
  Items.unregisterSheet('core', ItemSheet)
  Items.registerSheet('cairn', CairnItemSheet, { makeDefault: true })

  // If you need to add Handlebars helpers, here are a few useful examples:
  Handlebars.registerHelper('concat', function () {
    let outStr = ''

    for (const arg in arguments) {
      if (typeof arguments[arg] !== 'object') {
        outStr += arguments[arg]
      }
    }

    return outStr
  })

  Handlebars.registerHelper('toLowerCase', function (str) {
    return str.toLowerCase()
  })

  Handlebars.registerHelper('boldIf', function (cond, options) {
    return (cond) ? '<b>' + options.fn(this) + '</b>' : options.fn(this)
  })
})
