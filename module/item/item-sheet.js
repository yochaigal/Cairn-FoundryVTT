/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class CairnItemSheet extends ItemSheet {
  /** @override */
  static get defaultOptions () {
    return mergeObject(super.defaultOptions, {
      classes: ['cairn', 'sheet', 'item'],
      width: 480,
      height: 480,
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
    return `${path}/${this.item.type}-sheet.html`
  }

  /* -------------------------------------------- */

  /** @override */
  getData () {
    return super.getData();
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

		// If it's bulky it cannot be weightless too
		html.find("[name='system.bulky']").change((e) => {
      if(e.target.checked){
        if(html.find("[name='system.weightless']").length > 0){
          html.find("[name='system.weightless']")[0].checked = false;
        }
      }
		});
    html.find("[name='system.weightless']").change((e) => {
      if(e.target.checked){
        if(html.find("[name='system.bulky']").length > 0) {
          html.find("[name='system.bulky']")[0].checked = false;
        }
      }
    });
	}
}
