/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class CairnItemSheet extends ItemSheet {
  /** @override */
  static get defaultOptions () {
    return mergeObject(super.defaultOptions, {
      classes: ['cairn', 'sheet', 'item'],
      width: 600,
      height: 580,
      tabs: [
        {
          navSelector: ".tabs",
          contentSelector: ".content",
          initial: "description",
        },
      ],
    })
  }

  /** @override */
  get template () {
    const path = 'systems/cairn/templates/item'
    return `${path}/${this.item.data.type}-sheet.html`
  }

  /* -------------------------------------------- */

  /** @override */
  getData () {
    return super.getData()
  }

  /* -------------------------------------------- */

  /** @override */
  setPosition (options = {}) {
    const position = super.setPosition(options)
    const sheetBody = this.element.find('.sheet-body')
    const bodyHeight = position.height - 192
    sheetBody.css('height', bodyHeight)
    return position
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners (html) {
		super.activateListeners(html);

		// Everything below here is only needed if the sheet is editable
		if (!this.options.editable) return;

		// Roll handlers, click handlers, etc. would go here.

		// Prevent entering any less than 1 / 1000 of a slot per item.
		html.find("[name='data.slots']").change((e) => {
      const value = parseFloat(e.target.value);
			if (value !== 0 && value < 0.001) {
				ui.notifications.error("Slots Value should be 0 or greater than 0.001");
				e.target.value = 0;
			}
		});
	}
}
