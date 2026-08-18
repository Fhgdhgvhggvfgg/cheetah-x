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
	
               let randomNum = Math.floor(Math.random() * 3);
            if(Vars.state.isGame()){
            let playerCore = Vars.player.team().core();
            if(playerCore != null && randomNum == 1){
                playerCore.items.add(Vars.content.item("cheetah-x-cristal"), 10);
            }
            else if(playerCore != null && randomNum == 2)
            {
            	playerCore.items.add(Vars.content.item("cheetah-x-gold"), 20);
            }
            else
            {
            	playerCore.items.add(Vars.content.item("cheetah-x-elixir"), 15);
            }
           } 
            
}, 10, 16);


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
