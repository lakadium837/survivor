
import { Engine } from "../Engine";
import { Collection } from "../util/Collection";

export enum MOD_CONFLICTS {
    CYCLE,
    STRATEGIES,
    TRAITS,
    CASTAWAYS,
    EVENTS
}

export interface Mod {
    name: string,
    load: (engine: Engine) => void,
    unload: (engine: Engine) => void,
    conflicts: Array<MOD_CONFLICTS>
}

export class ModLoader extends Collection<Mod> {
    engine: Engine
    constructor(engine: Engine) {
        super();
        this.engine = engine;
    }

    load(script: string|Mod) : string|null {
        if (typeof script === "string") {
            let rtrn;
            try {
                rtrn = eval(script);
            }catch(err) {
                return "Mod wasn't parsed correctly.";
            }
            if (!rtrn  
                || !rtrn.load 
                || !rtrn.unload 
                || !rtrn.name
                || typeof rtrn.load !== "function"
                || typeof rtrn.unload !== "function"
                || typeof rtrn.name !== "string"
            ) return "Mod is not configured properly.";
            if (rtrn.conflicts instanceof Array && rtrn.conflicts.includes(MOD_CONFLICTS.CYCLE) && this.some(m => m.conflicts.includes(MOD_CONFLICTS.CYCLE))) {
                return `Mod has conflicts with ${this.find(m => m.conflicts.includes(MOD_CONFLICTS.CYCLE))?.name}`;
            }
            this.set(rtrn.name, rtrn);
            rtrn.load(this.engine);
            return null;
        } else {
            this.set(script.name, script);
            script.load(this.engine);
            return null;
        }
    }

    unload(name: string) : void {
        const mod = this.get(name);
        if (!mod) return;
        mod.unload(this.engine);
    }

}