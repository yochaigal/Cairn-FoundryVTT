import { findCompendiumItem } from './compendium.js'
import { evaluateFormula } from './utils.js'

export class Damage {

    /**
     * @description Apply damage to several tokens
     * @param {String[]} targets Array of Id of the targeted tokens
     * @param {Number} damage Positive number
     */
    static applyToTargets(targets, damage) {
        targets.forEach(target => {
            const data = this.applyToTarget(target, damage);
            this._showDetails(data);
        });
    }

    /**
     * @description Apply damage to one token
     * @param {*} target Id of one token
     * @param {*} damage Amount of damaage
     * @returns actor + old and new values
     */
    static applyToTarget(target, damage) {
        const tokenDoc = canvas.scene.tokens.get(target);
        // Linked to Actor
        if (tokenDoc.isLinked) {
            const armor = tokenDoc.actor.system.armor;
            const hp = tokenDoc.actor.system.hp.value;
            const str = tokenDoc.actor.system.abilities.STR.value;

            let {dmg, newHp, newStr} = this._calculateHpAndStr(damage, armor, hp, str);

            tokenDoc.actor.update({'system.hp.value': newHp, 'system.abilities.STR.value': newStr});

            const actor = tokenDoc.actor;

            return { actor, dmg, damage, armor, hp, str, newHp, newStr };
        }
        // Synthetic actor
        else {
            let armor = tokenDoc.actorData?.system?.armor;
            if (armor === undefined) armor = tokenDoc.actor.system.armor;

            let hp = tokenDoc.actorData?.system?.hp?.value;
            if (hp === undefined) hp = tokenDoc.actor.system.hp.value; 

            let str = tokenDoc.actorData?.system?.abilities?.STR?.value;
            if (str === undefined) str = tokenDoc.actor.system.abilities.STR.value;

            let {dmg, newHp, newStr} = this._calculateHpAndStr(damage, armor, hp, str);
            tokenDoc.modifyActorDocument({'system.hp.value': newHp, 'system.abilities.STR.value': newStr});

            const actor = ( tokenDoc.actorData !== undefined ) ? tokenDoc.actorData : tokenDoc.actor

            return { actor, dmg, damage, armor, hp, str, newHp, newStr };
        }
    }

    /**
     * @description Apply damage to a target token based on the token's id
     * @param {*} event 
     * @param {*} html 
     * @param {*} data 
     */
    static onClickChatMessageApplyButton(event, html, data){
        const btn = $(event.currentTarget);
        const targets = btn.data("targets");

        let targetsList = targets.split(';');

        // Shift Click allow to target the targeted tokens
        if (event.shiftKey) {            
            for (let index = 0; index < targetsList.length; index++) {
                const target = targetsList[index];
                const token = canvas.scene.tokens.get(target).object;
                const releaseOthers = (index == 0 ? (!token.isTargeted ? true : false) : false);
                const targeted = !token.isTargeted;
                token.setTarget(targeted, {releaseOthers: releaseOthers});
            }
        }
        // Apply damage to targets
        else {
            if (targets !== undefined) {
                const dmg = parseInt(html.find(".dice-total").text());
                this.applyToTargets(targetsList, dmg);
            }
        }
    }

    /**
     * @description Damage are reduced by armor, then apply to HP, and then to STR if not enough HP
     * @param {*} damage 
     * @param {*} armor 
     * @param {*} hp 
     * @param {*} str 
     * @returns damage done, new HP value and STR value
     */
     static _calculateHpAndStr(damage, armor, hp, str) {
        let dmg = damage - armor;
        if (dmg < 0) dmg = 0;

        let newHp;
        let newStr = str;
        if (dmg <= hp) { 
            newHp = hp - dmg;
            if (newHp < 0) newHp = 0;
        }
        else {
            newHp = 0;
            newStr = str - (dmg - hp);
        }

        return {dmg, newHp, newStr};
    }

    /**
     * Show chat message details of damage done for a token
     * @param data
     * @private
     */
    static _showDetails(data) {

        const { actor, dmg, damage, armor, hp, str, newHp, newStr } = data

        let content = '<p><strong>' + game.i18n.localize('CAIRN.Damage') + '</strong>: ' + dmg + ' (' + damage + '-' + armor + ')</p>'
        if (newHp !== hp) {
            content += '<p><strong>' + game.i18n.localize('CAIRN.HitProtection') + '</strong>: <s>' + hp + '</s> => ' + newHp + '</p>'
        } else {
            content += '<p><strong>' + game.i18n.localize('CAIRN.HitProtection') + '</strong>: ' + hp + '</p>'
        }
        if (newStr !== str) {
            content += '<p><strong>' + game.i18n.localize('STR') + '</strong>: <s>' + str + '</s> => ' + newStr + '</p>'
        }

        if (newStr < str) {
            if (newStr === 0) {
                content += '<strong>' + game.i18n.localize('CAIRN.Dead') + '</strong>'
            } else  {
                content += '<p><strong>' + game.i18n.localize('CAIRN.StrSave') + '</strong></p>'
                content += '<button type="button" class="roll-str-save">Roll STR save</button>'
            }
        } else if (newHp === 0 && hp !== 0) {
            content += '<p><strong>' + game.i18n.localize('CAIRN.Scars') + '</strong></p>'
            this._rollScarsTable(dmg);
        }

        ChatMessage.create({
            user: game.user._id,
            speaker: { actor },
            content: content,
        }, {})

    }

    static async _rollScarsTable(damage){
        const table = await findCompendiumItem("cairn.utils", "Scars");
        const roll = new Roll(damage.toString());
        await table.draw({roll});
    }

    static async _rollStrSave(actor,html){
        const roll = await evaluateFormula("d20cs<=@STR", actor.getRollData());
        const label = game.i18n.format("CAIRN.Save",{key: game.i18n.localize("STR")});
        const rolled = roll.terms[0].results[0].result;
        const result = roll.total === 0 ? game.i18n.localize("CAIRN.Fail") : game.i18n.localize("CAIRN.Success");
        const resultCls = roll.total === 0 ? "failure" : "success";
        roll.toMessage({
            speaker: ChatMessage.getSpeaker({ actor: actor }),
            flavor: label,
            content: `<div class="dice-roll"><div class="dice-result"><div class="dice-formula">${roll.formula}</div><div class="dice-tooltip" style="display: none;"><section class="tooltip-part"><div class="dice"><header class="part-header flexrow"><span class="part-formula">${roll.formula}</span></header><ol class="dice-rolls"><li class="roll die d20">${rolled}</li></ol></div></section></div><h4 class="dice-total ${resultCls}">${result} (${rolled})</h4</div></div>`,
        });
        html.find(".roll-str-save").attr('disabled','disabled')
    }
}
