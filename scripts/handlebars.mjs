/** The helpers the templates use. Registered once, at init. */
export function registerHandlebarsHelpers() {
  Handlebars.registerHelper('concat', (...args) =>
    args.filter((arg) => typeof arg !== 'object').join(''),
  );
  Handlebars.registerHelper('toLowerCase', (str) => String(str).toLowerCase());
  Handlebars.registerHelper('boldIf', function (cond, options) {
    return cond ? `<strong>${options.fn(this)}</strong>` : options.fn(this);
  });
  Handlebars.registerHelper('ifPrint', (cond, v1) => (cond ? v1 : ''));
  Handlebars.registerHelper('ifPrintElse', (cond, v1, v2) => (cond ? v1 : v2));
  Handlebars.registerHelper('times', function (n, block) {
    let out = '';
    for (let i = 0; i < n; i += 1) {
      block.data.index = i;
      block.data.first = i === 0;
      block.data.last = i === n - 1;
      out += block.fn(this);
    }
    return out;
  });
  Handlebars.registerHelper('isNotNull', (val) => val !== null && val !== undefined);
  Handlebars.registerHelper('isFatigue', (val) => val === game.i18n.localize('CAIRN.Fatigue'));
  Handlebars.registerHelper('not', (val) => !val);
  Handlebars.registerHelper('markItemUsed', function (item, options) {
    const usable = item.system.uses?.max;
    return usable && item.system.uses.value <= 0
      ? `<span style="opacity: 0.65;">${options.fn(this)}</span>`
      : options.fn(this);
  });
  Handlebars.registerHelper('hidden', (val) => (val ? 'display: none' : ''));
}
