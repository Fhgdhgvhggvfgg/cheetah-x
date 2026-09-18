require("dialogs");

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

var active = false;
var table;

function newTable() {
    let t = new Table();
    t.bottom().left();
    t.table(Tex.pane, t => {
        let b = new Button(Styles.none);
        let icon = new TextureRegionDrawable(Blocks.switchBlock.uiIcon);
        b.button(icon, () => {});
        t.add(b).size(50, 50);
    });

    t.visibility = () => {
        return Vars.ui.hudfrag.shown && !Vars.ui.consolefrag.shown() && !Vars.ui.minimapfrag.shown() && !Vars.net.client();
    };

    t.clicked(() => {
        if (Vars.net.client()) return;
        active = !active;
        Vars.state.rules.editor = active;
    });
    return t;
}

Events.on(WorldLoadEvent, () => {
    active = false;
    try { Vars.ui.hudGroup.removeChild(table); } catch(e) {}
    table = newTable();
    if (!Vars.state.rules.editor) {
        Vars.ui.hudGroup.addChild(table);
    }
    try { table.setPosition(0, 230); } catch(e) {}
});

//===================================================================

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

Events.on(ClientLoadEvent, function() {
    var iconTable = new Table();
    iconTable.top().left();
    iconTable.setFillParent(true);
    iconTable.touchable = Touchable.disabled;
   
    iconTable.update(function() {
        iconTable.clearChildren();
        
        if (Vars.ui != null && Vars.player != null && Vars.player.unit() != null) {
            var playerUnit = Vars.player.unit();
            let si = 200;
            let siy = 96;
            let left = 0;
            let top = 150;
            
            if (playerUnit.type != null && playerUnit.type.name.endsWith("cheetah-x-keven")) {
                
                // استخدام نفس الأمر مباشرة داخل الجدول
                iconTable.image(Core.atlas.find("cheetah-x-keven_p"))
                      .size(si)
                      .padLeft(left)
                      .padTop(top);
                      
                                      iconTable.image(Core.atlas.find("cheetah-x-keven-name"))
                      .size(si,siy)
                      .padLeft(left - 200)
                      .padTop(top + 245);
            }else if (playerUnit.type != null && playerUnit.type.name.endsWith("cheetah-x-jeff")) {
                
                // استخدام نفس الأمر مباشرة داخل الجدول
                iconTable.image(Core.atlas.find("cheetah-x-jeff_p"))
                      .size(si)
                      .padLeft(left)
                      .padTop(top);
                      
                                      iconTable.image(Core.atlas.find("cheetah-x-demon-name"))
                      .size(si,siy)
                      .padLeft(left - 200)
                      .padTop(top + 245);
            }else if (playerUnit.type != null && playerUnit.type.name.endsWith("cheetah-x-jamaica")) {
                
                // استخدام نفس الأمر مباشرة داخل الجدول
                iconTable.image(Core.atlas.find("cheetah-x-jamaica_p"))
                      .size(si)
                      .padLeft(left)
                      .padTop(top);
                      
                                      iconTable.image(Core.atlas.find("cheetah-x-jamaica-name"))
                      .size(si,siy)
                      .padLeft(left - 200)
                      .padTop(top + 245);
                      
            }else if (playerUnit.type != null && playerUnit.type.name.endsWith("cheetah-x-lora")) {
                
                // استخدام نفس الأمر مباشرة داخل الجدول
                iconTable.image(Core.atlas.find("cheetah-x-lora_p"))
                      .size(si)
                      .padLeft(left)
                      .padTop(top);
                                      iconTable.image(Core.atlas.find("cheetah-x-par-name"))
                      .size(si,siy)
                      .padLeft(left - 200)
                      .padTop(top + 245);
            }else if (playerUnit.type != null && playerUnit.type.name.endsWith("cheetah-x-bradar")) {
                
                // استخدام نفس الأمر مباشرة داخل الجدول
                iconTable.image(Core.atlas.find("cheetah-x-bradar_p"))
                      .size(si)
                      .padLeft(left)
                      .padTop(top);
                                      iconTable.image(Core.atlas.find("cheetah-x-bradar-name"))
                      .size(si,siy)
                      .padLeft(left - 200)
                      .padTop(top + 245);
            }
            
            
            
        }
    });

    Core.scene.add(iconTable);
});
