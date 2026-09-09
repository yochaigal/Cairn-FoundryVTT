import { settings } from '../../settings.mjs';

/**
 * Slots and armor, shared by every Actor type. Written onto the model as
 * derived values; nothing here touches the database.
 */
export function prepareInventory(system, actor) {
  system.useItemIcons = settings.get('use-item-icons');
  system.showFeatures = settings.get('show-features-section');
  system.armor = calcArmor(actor);
  system.slotsUsed = calcSlotsUsed(system, actor);
  system.slotsMax = calcMaxSlots(system, actor);
  system.encumbered = system.slotsUsed >= system.slotsMax;
}

export function calcSlotsUsed(system, actor) {
  let total = actor.items.reduce((memo, item) => {
    const quantity = item.system.quantity ?? 1;
    if (item.system.bulky) return memo + 2 * quantity;
    if (item.system.weightless) return memo;
    return memo + quantity;
  }, 0);
  const goldThreshold = settings.get('use-gold-threshold');
  if (goldThreshold > 0 && system.gold) {
    total += actor.type === 'container' ? Math.ceil(system.gold / goldThreshold) : Math.floor(system.gold / goldThreshold);
  }
  return total;
}

export function calcArmor(actor) {
  const armor = actor.items
    .filter((item) => ['armor', 'item'].includes(item.type) && item.system.equipped)
    .map((item) => Number.parseInt(item.system.armor ?? 0, 10))
    .reduce((a, b) => a + b, 0);
  return Math.min(armor, 3);
}

export function calcMaxSlots(system, actor) {
  if (['npc', 'container'].includes(actor.type) && system.slots?.value > 0) return system.slots.value;
  if (actor.type === 'character' && settings.get('character-inventory-limit') && system.slots) return system.slots;
  return settings.get('max-equip-slots');
}
