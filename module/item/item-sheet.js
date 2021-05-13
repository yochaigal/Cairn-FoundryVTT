/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class CairnItemSheet extends ItemSheet {
  /** @override */
  static get defaultOptions () {
    return mergeObject(super.defaultOptions, {
      classes: ['cairn', 'sheet', 'item'],
      width: 450,
      height: 400
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
    super.activateListeners(html)

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return

    // Roll handlers, click handlers, etc. would go here.
  }
}
