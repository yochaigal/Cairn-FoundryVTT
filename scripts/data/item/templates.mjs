/**
 * What the old template.json shared between Item types, as functions of
 * the fields bag.
 */

/** Every item: description, the three flags, cost and quantity. */
export function universalFields(f) {
  const flag = () => new f.BooleanField({ required: true, nullable: false, initial: false });
  return {
    description: new f.HTMLField({ required: true, blank: true, initial: '' }),
    weightless: flag(),
    equipped: flag(),
    bulky: flag(),
    cost: new f.SchemaField({
      value: new f.NumberField({ required: true, nullable: false, integer: true, initial: 0 }),
    }),
    quantity: new f.NumberField({ required: true, nullable: false, integer: true, min: 0, initial: 1 }),
  };
}

/** Anything that deals damage. */
export function withDamageFields(f) {
  return {
    damageFormula: new f.StringField({ required: true, blank: true, initial: '' }),
    criticalDamage: new f.HTMLField({ required: true, blank: true, initial: '' }),
    blast: new f.BooleanField({ required: true, nullable: false, initial: false }),
  };
}

/** Anything with uses. */
export function consumableFields(f) {
  return {
    uses: new f.SchemaField({
      value: new f.NumberField({ required: true, nullable: false, integer: true, min: 0, initial: 0 }),
      max: new f.NumberField({ required: true, nullable: false, integer: true, min: 0, initial: 0 }),
    }),
  };
}

/** The old template declared `cost` as a number while the sheets wrote `cost.value`. */
export function liftCost(source) {
  if (typeof source.cost === 'number') source.cost = { value: source.cost };
  return source;
}
