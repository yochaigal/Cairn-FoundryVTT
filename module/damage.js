export class Damage {

    /**
     * @description Apply damage to several tokens
     * @param {String[]} targets Array of Id of the targeted tokens
     * @param {Number} damage Positive number
     */
    static applyToTargets(targets, damage) {
        targets.forEach(target => {
            this.applyToTarget(target, damage);
        });
    }

    /**
     * @description Apply damage to one token
     * @param {*} target Id of one token
     * @param {*} damage Amount of damaage
     * @returns An updated token
     */
    static applyToTarget(target, damage) {
        const tokenDoc = canvas.scene.tokens.get(target);
        // Linked to Actor
        if (tokenDoc.isLinked) {
            const armor = tokenDoc.actor.system.armor;
            const hp = tokenDoc.actor.system.hp.value;
            const str = tokenDoc.actor.system.abilities.STR.value;

            let {newHp, newStr} = this._calculateHpAndStr(damage, armor, hp, str);

            return tokenDoc.actor.update({'system.hp.value': newHp, 'system.abilities.STR.value': newStr});
        }
        // Synthetic actor
        else {
            let armor = tokenDoc.actorData?.system?.armor;
            if (armor === undefined) armor = tokenDoc.actor.system.armor;

            let hp = tokenDoc.actorData?.system?.hp?.value;
            if (hp === undefined) hp = tokenDoc.actor.system.hp.value; 

            let str = tokenDoc.actorData?.system?.abilities?.STR?.value;
            if (str === undefined) str = tokenDoc.actor.system.abilities.STR.value;

            let {newHp, newStr} = this._calculateHpAndStr(damage, armor, hp, str);
            return tokenDoc.modifyActorDocument({'system.hp.value': newHp, 'system.abilities.STR.value': newStr});
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
     * @returns new HP value and STR value
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

        return {newHp, newStr};
    }
}