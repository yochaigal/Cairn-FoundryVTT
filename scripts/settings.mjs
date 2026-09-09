import { SystemConfig } from '@vttforge/core';

export const SYSTEM_ID = 'cairn';

/** One wrapper for every read of a Cairn setting: `settings.get('use-panic')`. */
export const settings = new SystemConfig(SYSTEM_ID);

const WORLD_SETTINGS = [
  ['max-equip-slots', 'MaxEquipSlots', Number, 10],
  ['use-gold-threshold', 'UseGoldThreshold', Number, 0],
  ['show-gold-not-cost', 'ShowGoldNotCost', Boolean, false],
  ['use-panic', 'UsePanic', Boolean, false],
  ['use-item-icons', 'UseItemIcons', Boolean, true],
  ['use-cairn-dice-notation', 'UseCairnDiceNotation', Boolean, true],
  ['show-generate-header', 'ShowGenerateHeader', Boolean, false],
  ['show-features-section', 'ShowFeatures', Boolean, false],
  ['show-container-actors', 'ShowContainerActors', Boolean, false],
  ['character-inventory-limit', 'CharacterInventoryLimit', Boolean, false],
];

/** Runs inside `init`, where `game.settings` accepts registrations. */
export function registerSettings() {
  for (const [key, label, type, initial] of WORLD_SETTINGS) {
    settings.register(key, {
      name: `CAIRN.Settings.${label}.label`,
      hint: `CAIRN.Settings.${label}.hint`,
      scope: 'world',
      config: true,
      type,
      default: initial,
      requiresReload: true,
    });
  }
}
