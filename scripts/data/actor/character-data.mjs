import { BaseTypeDataModel, fields } from '@vttforge/core';
import { settings } from '../../settings.mjs';
import { actorBaseFields, featureField } from './templates.mjs';
import { prepareInventory } from './inventory.mjs';

function defineCharacterSchema() {
  const f = fields();
  return {
    ...actorBaseFields(f),
    background: new f.StringField({ required: true, blank: true, initial: '' }),
    biography: new f.HTMLField({ required: true, blank: true, initial: '' }),
    notes: new f.HTMLField({ required: true, blank: true, initial: '' }),
    deprived: new f.BooleanField({ required: true, nullable: false, initial: false }),
    panicked: new f.BooleanField({ required: true, nullable: false, initial: false }),
    gold: new f.NumberField({ required: true, nullable: false, integer: true, initial: 0 }),
    /** A per-character slot limit, set from the sheet when the world allows it. */
    slots: new f.NumberField({ required: false, nullable: true, integer: true, initial: null }),
    /** UUIDs of the container actors this character carries. */
    containers: new f.ArrayField(new f.StringField({ required: true, blank: false })),
    features: new f.ArrayField(featureField(f)),
  };
}

export class CharacterData extends BaseTypeDataModel(defineCharacterSchema) {
  prepareDerivedData() {
    const actor = this.parent;
    prepareInventory(this, actor);
    this.showBio = true;
    this.showDesc = false;
    this.maybeTooMuchGold = false;
    this.containerObjects = this.containers
      .map((uuid) => game.actors.find((a) => a.uuid === uuid))
      .filter(Boolean);

    const goldThreshold = settings.get('use-gold-threshold');
    this.hasGoldThreshold = goldThreshold > 0;
    this.goldSlots = this.hasGoldThreshold && this.gold ? Math.floor(this.gold / goldThreshold) : 0;

    if (this.encumbered) {
      this.hp.value = 0;
      if (this.hasGoldThreshold && this.goldSlots > 0) this.maybeTooMuchGold = true;
    }

    this.usePanic = settings.get('use-panic');
    if (this.usePanic && this.panicked) this.hp.value = 0;

    this.characterEquipmentLimit = settings.get('character-inventory-limit');
  }
}
