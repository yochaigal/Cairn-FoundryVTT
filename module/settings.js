export const registerSettings = () => {
    game.settings.register("cairn", "max-equip-slots", {
        name: game.i18n.localize("CAIRN.Settings.MaxEquipSlots.label"),
        hint: game.i18n.localize("CAIRN.Settings.MaxEquipSlots.hint"),
        scope: "world",
        config: true,
        type: Number,
        default: 10
    });
}