require("dialogs");
require("character");

//================================================================

const defaultMinZoomLim = Vars.renderer.minZoom;
const defaultMaxZoomLim = Vars.renderer.maxZoom;
const minZoomLim = 0.5;
const maxZoomLim = 25;

function updateZoom(min, max){
    Vars.renderer.minZoom = min;
    Vars.renderer.maxZoom = max;
}

if(!Vars.headless) updateZoom(minZoomLim, maxZoomLim);

//================================================================

Timer.schedule(() => {
    if (Vars.state.isGame()) {
        let playerCore = Vars.player.team().core();
        
        // التحقق من أن النواة موجودة وليست فارغة
        if (playerCore != null) {
            let randomNum = Math.floor(Math.random() * 4);
            
            if (!Vars.state.isPaused()){
            if (randomNum == 1) {
                playerCore.items.add(Vars.content.item("cheetah-x-ram"), 2);
            } else if (randomNum == 2) {
                playerCore.items.add(Vars.content.item("cheetah-x-ram"), 3);
            } else if (randomNum == 3) {
                playerCore.items.add(Vars.content.item("cheetah-x-ram"), 1);
            } else {
            	
            }
            }
        }
    }
}, 10, 4);



//================================================================

    Events.on(BlockDestroyEvent, event => {
        let core = Vars.player.team().core();
        if (event.tile.team() != Vars.player.team()) {
            if (core != null) {
                // تدمير الأبراج
                if (event.tile.block() instanceof Turret) {
                    core.items.add(Vars.content.item("cheetah-x-elixir"), 4);
                    core.items.add(Vars.content.item("cheetah-x-ram_c"), 1);
                }
                // تدمير المصانع
                else if (event.tile.block() instanceof GenericCrafter) {
                    core.items.add(Vars.content.item("cheetah-x-gold"), 1);
                    core.items.add(Vars.content.item("cheetah-x-ram"), 3);
                }
                // تدمير مصانع الوحدات
                else if (event.tile.block() instanceof UnitFactory) {
                    core.items.add(Vars.content.item("cheetah-x-cristal"), 3);
                 core.items.add(Vars.content.item("cheetah-x-ram"), 6);
                }
                // تدمير النواة (الـ Core)
            }
        }
    });
    

//===================================================================

Events.on(UnitDestroyEvent, event => {
    let unit = event.unit;
    let core = Vars.player.team().core();
    
    // التأكد من أن الوحدة موجودة وتنتمي لنفس فريق اللاعب
    if (unit != null && unit.team == Vars.player.team()) {
        // التحقق من اسم الوحدة البري عن طريق النص لتجنب مشاكل التحميل
        if (unit.type.name.includes("gold_alien")) {
            
            if (core != null) {
                core.items.add(Vars.content.item("cheetah-x-gold"), 40);
            }
        }
    }
    
    if (unit != null && unit.team != Vars.player.team()) {
    	if (unit.isFlying()) {
    	}else {
    	            
            if (core != null) {
    	core.items.add(Vars.content.item("cheetah-x-ram"), 1);
    }
    }
    	
    	}
});

//========================================================
