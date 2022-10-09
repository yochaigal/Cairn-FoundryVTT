import { getCombatantInitiative, getTokenDisposition } from './utils.js'

/**
 * @extends Combat
 */
export class CairnCombat extends Combat {
  /** @override */
  async rollInitiative(ids, options) {
    await super.rollInitiative(ids, options);
    ids = typeof ids === "string" ? [ids] : ids;

    for ( let [i, id] of ids.entries() ) {
      const combatant = this.combatants.get(id);
      const initiative = getCombatantInitiative(combatant);
      const isFriendly = (combatant.token && getTokenDisposition(combatant.token)) === 1 ?? false;
      if (isFriendly) {
        const rollData = combatant.actor.getRollData();
        const initiativeSuccess = initiative <= rollData.DEX;
        await combatant.update({initiative: initiativeSuccess ? 1 : -1});
      } else {
        await combatant.update({initiative: 0});
      }
    }
  }
}
