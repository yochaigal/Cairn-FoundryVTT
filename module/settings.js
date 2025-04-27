export const registerSettings = () => {
  game.settings.register("cairn", "max-equip-slots", {
    name: game.i18n.localize("CAIRN.Settings.MaxEquipSlots.label"),
    hint: game.i18n.localize("CAIRN.Settings.MaxEquipSlots.hint"),
    scope: "world",
    config: true,
    type: Number,
    default: 10,
    requiresReload: true,
  });

  game.settings.register("cairn", "use-gold-threshold", {
    name: game.i18n.localize("CAIRN.Settings.UseGoldThreshold.label"),
    hint: game.i18n.localize("CAIRN.Settings.UseGoldThreshold.hint"),
    scope: "world",
    config: true,
    type: Number,
    default: 0,
    requiresReload: true,
  });

  game.settings.register("cairn", "use-panic", {
    name: game.i18n.localize("CAIRN.Settings.UsePanic.label"),
    hint: game.i18n.localize("CAIRN.Settings.UsePanic.hint"),
    scope: "world",
    config: true,
    type: Boolean,
    default: false,
    requiresReload: true,
  });

  game.settings.register("cairn", "use-item-icons", {
    name: game.i18n.localize("CAIRN.Settings.UseItemIcons.label"),
    hint: game.i18n.localize("CAIRN.Settings.UseItemIcons.hint"),
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
    requiresReload: true,
  });

  game.settings.register("cairn", "use-cairn-dice-notation", {
    name: game.i18n.localize("CAIRN.Settings.UseCairnDiceNotation.label"),
    hint: game.i18n.localize("CAIRN.Settings.UseCairnDiceNotation.hint"),
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
    requiresReload: true,
  });

  game.settings.register("cairn", "show-generate-header", {
    name: game.i18n.localize("CAIRN.Settings.ShowGenerateHeader.label"),
    hint: game.i18n.localize("CAIRN.Settings.ShowGenerateHeader.hint"),
    scope: "world",
    config: true,
    type: Boolean,
    default: false,
    requiresReload: true,
  });

  game.settings.register("cairn", "show-features-section", {
    name: game.i18n.localize("CAIRN.Settings.ShowFeatures.label"),
    hint: game.i18n.localize("CAIRN.Settings.ShowFeatures.hint"),
    scope: "world",
    config: true,
    type: Boolean,
    default: false,
    requiresReload: true,
  });
};
