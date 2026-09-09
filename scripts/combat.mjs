
/**
 * @extends Combat
 */
export class CairnCombat extends Combat {
  /** @override */
  async rollInitiative(ids, options) {
    await super.rollInitiative(ids, options);
    ids = typeof ids === "string" ? [ids] : ids;

    for ( const [, id] of ids.entries() ) {
      const combatant = this.combatants.get(id);
      const isFriendly = (combatant.token?.disposition ?? 0) === 1 ?? false;
      if (isFriendly) {
        const rollData = combatant.actor.getRollData();
        const initiativeSuccess = combatant.initiative <= rollData.DEX;
        await combatant.update({initiative: initiativeSuccess ? 1 : -1});
      } else {
        await combatant.update({initiative: 0});
      }
    }
  }
}
