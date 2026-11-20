var active = false;
var editorMenuTable1; // جدول الزر الأول
var editorMenuTable2; // جدول الزر الثاني
var phoValue = 0; // متغير عالمي ومؤقت يبدأ من الصفر
var uip = 1;

Events.on(ClientLoadEvent, () => {
    let table = new Table(); // تم تعريف المتغير بشكل صحيح لتجنب انهيار اللعبة
    
    Time.run(60, () => {
        Vars.ui.menuGroup.fill(Cons(t => {           
            t.clear(); // تنظيف الطبقات القديمة 
            t.left().bottom(); // نقطة الصفر أسفل يسار
            
            let bPho4 = new Button(Styles.none);
            bPho4.button(new TextureRegionDrawable(Icon.info), () => { menuWelcome(); });
            bPho4.add("setting").padLeft(6); 
            t.add(bPho4).size(160, 50).padTop(-240).padLeft(50);
        }));
    });
});



function startGridGame() {
    const size = 7;
    let playerX = 3;
    let playerY = 3;
    let dirX = 0;
    let dirY = -1; // الاتجاه الفعلي الحالي للأفعى
    let snakeTail = []; // [{ x, y }, ...] ذيل الأفعى (o)
    let pendingGrowth = 0;

    let starX = 1;
    let starY = 1;
    let mineX = 5;
    let mineY = 5;
    let score = 0;
    let lives = 3;
    let gameOver = false;
    let statusText = "Collect stars (*) and avoid mines (X)!";

    const d = new BaseDialog("Grid Mini-Game");
    let moveTask = null;

    function stopLoop() {
        if (moveTask != null) {
            moveTask.cancel();
            moveTask = null;
        }
    }

    function startLoop() {
        stopLoop();
        moveTask = Timer.schedule(() => {
            if (!d.isShown() || gameOver) {
                return;
            }
            moveTo(playerX + dirX, playerY + dirY);
        }, 0.5, 0.5);
    }

    function setDirection(ndx, ndy) {
        if (gameOver || !d.isShown()) return;

        // منع العودة للخلف بناءً على اتجاه الحركة الفعلي الحالي للأفعى
        if (ndx === -dirX && ndy === -dirY) {
            return;
        }

        // تحديث الاتجاه والتحرك فوراً
        dirX = ndx;
        dirY = ndy;

        moveTo(playerX + dirX, playerY + dirY);

        // إعادة جدولة المؤقت لكي تكون الخطوة التلقائية التالية بعد 0.5 ثانية من الحركة الفورية
        if (!gameOver) {
            startLoop();
        }
    }

    function isTailAt(x, y) {
        for (let i = 0; i < snakeTail.length; i++) {
            if (snakeTail[i].x === x && snakeTail[i].y === y) {
                return true;
            }
        }
        return false;
    }

    function getOccupiedCells() {
        const list = [{ x: playerX, y: playerY }];
        for (let i = 0; i < snakeTail.length; i++) {
            list.push({ x: snakeTail[i].x, y: snakeTail[i].y });
        }
        return list;
    }

    function randomFreeCell(excludeList) {
        let nx = 0;
        let ny = 0;
        let valid = false;
        while (!valid) {
            nx = Math.floor(Math.random() * size);
            ny = Math.floor(Math.random() * size);
            valid = true;
            for (let i = 0; i < excludeList.length; i++) {
                if (excludeList[i].x === nx && excludeList[i].y === ny) {
                    valid = false;
                    break;
                }
            }
        }
        return { x: nx, y: ny };
    }

    function resetGame() {
        playerX = 3;
        playerY = 3;
        dirX = 0;
        dirY = -1;
        snakeTail = [{ x: 3, y: 4 }]; // ذيل مبدئي صغير (o) أسفل الرأس (O)
        pendingGrowth = 0;
        score = 0;
        lives = 3;
        gameOver = false;
        statusText = "New game started!";

        const occupied = getOccupiedCells();
        const sPos = randomFreeCell(occupied);
        starX = sPos.x;
        starY = sPos.y;

        occupied.push({ x: starX, y: starY });
        const mPos = randomFreeCell(occupied);
        mineX = mPos.x;
        mineY = mPos.y;

        render();
        startLoop();
    }

    function moveTo(nx, ny) {
        if (gameOver) return;
        if (nx < 0 || nx >= size || ny < 0 || ny >= size) {
            lives = 0;
            gameOver = true;
            statusText = "[red]Game Over! Hit the edge! Score: " + score;
            stopLoop();
            render();
            return;
        }

        const prevX = playerX;
        const prevY = playerY;

        playerX = nx;
        playerY = ny;

        // تحريك الذيل ليتبع الرأس
        if (snakeTail.length > 0 || pendingGrowth > 0) {
            const newTail = [{ x: prevX, y: prevY }];
            const keepCount = pendingGrowth > 0 ? snakeTail.length : Math.max(0, snakeTail.length - 1);
            for (let i = 0; i < keepCount; i++) {
                newTail.push({ x: snakeTail[i].x, y: snakeTail[i].y });
            }
            snakeTail = newTail;
            if (pendingGrowth > 0) {
                pendingGrowth -= 1;
            }
        }

        // التحقق من اصطدام الرأس بالذيل
        if (isTailAt(playerX, playerY)) {
            lives = 0;
            gameOver = true;
            statusText = "[red]Game Over! Bit your own tail! Score: " + score;
            stopLoop();
            render();
            return;
        }

        if (playerX === starX && playerY === starY) {
            score += 10;
            pendingGrowth += 1;
            statusText = "[gold]+10 Score! Star collected!";

            const freeForStar = getOccupiedCells();
            freeForStar.push({ x: mineX, y: mineY });
            const nextStar = randomFreeCell(freeForStar);
            starX = nextStar.x;
            starY = nextStar.y;

            // نقل اللغم أحيانًا لزيادة التحدي
            if (score % 20 === 0) {
                const freeForMine = getOccupiedCells();
                freeForMine.push({ x: starX, y: starY });
                const nextMine = randomFreeCell(freeForMine);
                mineX = nextMine.x;
                mineY = nextMine.y;
            }
        } else if (playerX === mineX && playerY === mineY) {
            lives -= 1;
            statusText = "[scarlet]Boom! Hit a mine (-1 Life)";
            if (lives <= 0) {
                lives = 0;
                gameOver = true;
                statusText = "[red]Game Over! Final Score: " + score;
                stopLoop();
            } else {
                const freeForMine = getOccupiedCells();
                freeForMine.push({ x: starX, y: starY });
                const nextMine = randomFreeCell(freeForMine);
                mineX = nextMine.x;
                mineY = nextMine.y;
            }
        } else {
            statusText = "[lightgray]Pos: (" + playerX + ", " + playerY + ")";
        }

        render();
    }

    function render() {
        d.cont.clear();

        // شريط المعلومات
        d.cont.add("[accent]Score: [white]" + score + "   [scarlet]Lives: [white]" + lives + "   [gray](" + playerX + "," + playerY + ")").row();
        d.cont.add(statusText).padBottom(6).row();

        // شبكة الإحداثيات (غير قابلة للنقر)
        d.cont.table(cons(grid => {
            for (let y = 0; y < size; y++) {
                for (let x = 0; x < size; x++) {
                    let label = ".";
                    if (x === playerX && y === playerY) {
                        label = "[cyan]O";
                    } else if (isTailAt(x, y)) {
                        label = "[teal]o";
                    } else if (x === starX && y === starY) {
                        label = "[gold]*";
                    } else if (x === mineX && y === mineY) {
                        label = "[scarlet]X";
                    }

                    grid.add(label).size(48, 48).pad(2);
                }
                grid.row();
            }
        })).padBottom(10).row();

        // أزرار التحكم بالاتجاهات (كبيرة ومرتبة على 3 صفوف: أعلى، يسار/يمين، أسفل)
        d.cont.table(cons(ctrl => {
            // الصف الأول: زر الأعلى في المنتصف
            ctrl.add().size(92, 92).pad(4);
            ctrl.button("^", () => setDirection(0, -1)).size(92, 92).pad(4);
            ctrl.add().size(92, 92).pad(4);
            ctrl.row();

            // الصف الثاني: زر اليسار، فراغ بالمنتصف، زر اليمين
            ctrl.button("<", () => setDirection(-1, 0)).size(92, 92).pad(4);
            ctrl.add().size(92, 92).pad(4);
            ctrl.button(">", () => setDirection(1, 0)).size(92, 92).pad(4);
            ctrl.row();

            // الصف الثالث: زر الأسفل في المنتصف
            ctrl.add().size(92, 92).pad(4);
            ctrl.button("v", () => setDirection(0, 1)).size(92, 92).pad(4);
            ctrl.add().size(92, 92).pad(4);
        })).row();
    }

    d.hidden(() => stopLoop());

    d.buttons.clear();
    d.buttons.button("Restart", () => resetGame()).size(150, 60).padRight(10);
    d.buttons.button("Close", () => {
        stopLoop();
        d.hide();
    }).size(150, 60);

    resetGame();
    d.show();
}





// دالة عرض النافذة الترحيبية / التعليمات بشكل مستقل
function menuWelcome() {
    const d = new BaseDialog("hello");
    
    
    d.cont.pane(p => {

            p.button("no photo", Icon.add, () => {
        	    if (uip == 0) { 
            uip = 1;
            }else{
            	uip = 0;
            }
            
        }).size(200, 80).pad(10).row();
        
              p.button("snack mini game", Icon.add, () => {
startGridGame();
        }).size(120, 80).padTop(-100).padLeft(320).row();
        
        
    
        p.image(Core.atlas.find("cheetah-x-welcome_logo")).size(600, 600).pad(10).row();
        p.add("The mod will be ready soon. You just have to wait a little longer.").row();
        
                // زر لتنفيذ عملية رياضية (تغيير القيمة بشكل دائرى رياضياً باستخدام باقي القسمة)
        
        
        const studyTex = Core.atlas.find("cheetah-x-study");
        p.image(studyTex).size(600, 600).pad(10).row();
        p.add("How to collect gold.").row();
        
        const studyTex2 = Core.atlas.find("cheetah-x-study2");
        p.image(studyTex2).size(600, 600).pad(10).row();
        p.add("The way the game starts. py ram").row();
        
        const studyTexD = Core.atlas.find("cheetah-x-developer");
        p.image(studyTexD).size(600, 600).pad(10).row();
        p.add("just for developers").row();
        
        const studyTex3 = Core.atlas.find("cheetah-x-keven_u_p");
        p.image(studyTex3).size(600, 600).pad(10).row();
        
        // أزرار الروابط الخارجية
        p.button("keven 01", Icon.link, () => Core.app.openURI("https://fhgdhgvhggvfgg.github.io/Cpe-cheetah-/warehouse/")).size(160, 80).padTop(-1000).padLeft(-400).row();
        p.button("mindustry", Icon.link, () => Core.app.openURI("https://fhgdhgvhggvfgg.github.io/Cpe-cheetah-/cheetah-m/")).size(160, 80).padTop(-1000).padLeft(350).row();
        p.add("come to our page for the latest news").row();
    }).size(1000, 600);
    
        d.buttons.button("gooo to game", () => {
        d.hide(); // إغلاق النافذة
        
        // إزالة القوائم القديمة من الشاشة
        try { 
            if (editorMenuTable1 != null) Vars.ui.hudGroup.removeChild(editorMenuTable1); 
        } catch(e) {}

        // إنشاء الجداول الجديدة وتحديثها بالقيمة الحالية
        let menus = createEditorMenus();
        editorMenuTable1 = menus.menu1;;
        
        if (!Vars.state.rules.editor) {
            Vars.ui.hudGroup.addChild(editorMenuTable1);
        }
        
        // ضبط إحداثيات الأزرار في مكانها الصحيح
        try { 
            editorMenuTable1.setPosition(340, -330); 
        } catch(e) {}
        
    }).size(300, 100);

    d.show();
}


// --- دالة إنشاء وتحديد إحداثيات الأزرار ---
function createEditorMenus() {
    
let menu1 = new Table();
menu1.setFillParent(true);
menu1.top().left();

menu1.table(Tex.pane, t => {
    let iconPho = new TextureRegionDrawable(Icon.add);
    
    if (uip == 1) {
        let bPho = new Button(Styles.none);
        bPho.button(iconPho, () => { phoValue = 0; });
        t.add(bPho).size(50, 50).padBottom(20);
        t.row();
        
        let bPho2 = new Button(Styles.none);
        bPho2.button(iconPho, () => { phoValue = 1; });
        t.add(bPho2).size(50, 50).padBottom(20);
        t.row();
        
        let bPho3 = new Button(Styles.none);
        bPho3.button(iconPho, () => { phoValue = 2; });
        t.add(bPho3).size(50, 50).padBottom(20);
        t.row();
    }
});

// إزالة شرط عدم الاهتمام بالأونلاين (!Vars.net.client) لكي يظهر الجدول حتى في اللعب الجماعي
menu1.visibility = () => {
    return Vars.ui.hudfrag.shown && 
           !Vars.ui.consolefrag.shown() && 
           !Vars.ui.minimapfrag.shown();
};

    // --- 2. الزر الثاني (زر وضع التحرير أو الإعدادات) ---
    let menu2 = new Table();
    menu2.bottom().left();
    
    menu2.table(Tex.pane, t => { 
    if (!Vars.state.isCampaign()) {   
    
        let bEdit = new Button(Styles.none);
        let iconEdit = new TextureRegionDrawable(Blocks.switchBlock.uiIcon);
        bEdit.button(iconEdit, () => {
            if (Vars.net.client()) return;
            active = !active;
            Vars.state.rules.editor = active;
        });
        t.add(bEdit).size(50, 50);
    }    
        let bPho4 = new Button(Styles.none);
        bPho4.button(new TextureRegionDrawable(Icon.info), () => { menuWelcome(); });
        bPho4.add("setting").padLeft(6); 
        t.add(bPho4).size(160, 50); 
    });

    menu2.visibility = () => {
        return Vars.ui.hudfrag.shown && 
               !Vars.ui.consolefrag.shown() && 
               !Vars.ui.minimapfrag.shown();
    };

    return { menu1: menu1, menu2: menu2 };
}


// --- استدعاء القوائم عند تحميل العالم وتحديد إحداثيات كل زر على حدة ---
Events.on(WorldLoadEvent, () => {
    active = false;
    
    // إزالة القوائم القديمة إن وجدت
    try { 
        if (editorMenuTable1 != null) Vars.ui.hudGroup.removeChild(editorMenuTable1); 
        if (editorMenuTable2 != null) Vars.ui.hudGroup.removeChild(editorMenuTable2); 
    } catch(e) {}

    // إنشاء الجداول الجديدة
    let menus = createEditorMenus();
    editorMenuTable1 = menus.menu1;
    editorMenuTable2 = menus.menu2;
    
    if (!Vars.state.rules.editor) {
        Vars.ui.hudGroup.addChild(editorMenuTable1);
        Vars.ui.hudGroup.addChild(editorMenuTable2);
    }
    
    // --- ضبط إحداثيات كل زر بشكل مستقل تماماً ---
    try { 
        // إحداثيات الزر الأول (مثال: x = 0, y = 230)
        editorMenuTable1.setPosition(340, -330); 
        
        // إحداثيات الزر الثاني (مثال: x = 60, y = 230 بجانبه، أو أي إحداثيات أخرى تريدها)
        editorMenuTable2.setPosition(0, 230); 
    } catch(e) {}
});


Events.on(ClientLoadEvent, function() {
    var iconTable = new Table();
    iconTable.top().left();
    iconTable.setFillParent(true);
    iconTable.touchable = Touchable.disabled;
   
    iconTable.update(function() {
        iconTable.clearChildren();
        
        if (Vars.ui.hudfrag.shown){
           	
        if (Vars.ui != null && Vars.player != null && Vars.player.unit() != null) {
            var playerUnit = Vars.player.unit();
            let si = 200;
            let siy = 96;
            let left = 0;
            let top = 150;
                if (uip == 1) {
                	
            if (playerUnit.type != null && playerUnit.type.name.endsWith("cheetah-x-keven")) {
                
                // استخدام نفس الأمر مباشرة داخل الجدول
                if (phoValue == 0)
                {
                iconTable.image(Core.atlas.find("cheetah-x-keven_p"))
                        .size(si)
                      .padLeft(left)
                      .padTop(top);              
                } else if (phoValue == 1){
                iconTable.image(Core.atlas.find("cheetah-x-keven_p2"))
                       .size(si)
                      .padLeft(left)
                      .padTop(top);               
                } else {
                	iconTable.image(Core.atlas.find("cheetah-x-keven_p3"))
                      .size(si)
                      .padLeft(left)
                      .padTop(top);                
                }
                                      iconTable.image(Core.atlas.find("cheetah-x-keven-name"))
                      .size(si,siy)
                      .padLeft(left - 200)
                      .padTop(top + 245);
                            
                  
            }else if (playerUnit.type != null && playerUnit.type.name.endsWith("cheetah-x-jeff")) {
                
                // استخدام نفس الأمر مباشرة داخل الجدول
                 if (phoValue == 0)
                {
                iconTable.image(Core.atlas.find("cheetah-x-jeff_p"))
                        .size(si)
                      .padLeft(left)
                      .padTop(top);              
                } else if (phoValue == 1){
                iconTable.image(Core.atlas.find("cheetah-x-jeff_p2"))
                       .size(si)
                      .padLeft(left)
                      .padTop(top);               
                } else {
                	iconTable.image(Core.atlas.find("cheetah-x-jeff_p3"))
                      .size(si)
                      .padLeft(left)
                      .padTop(top);                
                }
                      
                                      iconTable.image(Core.atlas.find("cheetah-x-demon-name"))
                      .size(si,siy)
                      .padLeft(left - 200)
                      .padTop(top + 245);
            }else if (playerUnit.type != null && playerUnit.type.name.endsWith("cheetah-x-jamaica")) {
                
                // استخدام نفس الأمر مباشرة داخل الجدول
 if (phoValue == 0)
                {
                iconTable.image(Core.atlas.find("cheetah-x-jamaica_p"))
                        .size(si)
                      .padLeft(left)
                      .padTop(top);              
                } else if (phoValue == 1){
                iconTable.image(Core.atlas.find("cheetah-x-jamaica_p2"))
                       .size(si)
                      .padLeft(left)
                      .padTop(top);               
                } else {
                	iconTable.image(Core.atlas.find("cheetah-x-jamaica_p3"))
                      .size(si)
                      .padLeft(left)
                      .padTop(top);                
                }
                      
                                      iconTable.image(Core.atlas.find("cheetah-x-jamaica-name"))
                      .size(si,siy)
                      .padLeft(left - 200)
                      .padTop(top + 245);
                      
            }else if (playerUnit.type != null && playerUnit.type.name.endsWith("cheetah-x-lora")) {
                
                // استخدام نفس الأمر مباشرة داخل الجدول
 if (phoValue == 0)
                {
                iconTable.image(Core.atlas.find("cheetah-x-lora_p"))
                        .size(si)
                      .padLeft(left)
                      .padTop(top);              
                } else if (phoValue == 1){
                iconTable.image(Core.atlas.find("cheetah-x-lora_p2"))
                       .size(si)
                      .padLeft(left)
                      .padTop(top);               
                } else {
                	iconTable.image(Core.atlas.find("cheetah-x-lora_p3"))
                      .size(si)
                      .padLeft(left)
                      .padTop(top);                
                }
                
                
                                      iconTable.image(Core.atlas.find("cheetah-x-par-name"))
                      .size(si,siy)
                      .padLeft(left - 200)
                      .padTop(top + 245);
            }else if (playerUnit.type != null && playerUnit.type.name.endsWith("cheetah-x-bradar")) {
                
                // استخدام نفس الأمر مباشرة داخل الجدول
 if (phoValue == 0)
                {
                iconTable.image(Core.atlas.find("cheetah-x-bradar_p"))
                        .size(si)
                      .padLeft(left)
                      .padTop(top);              
                } else if (phoValue == 1){
                iconTable.image(Core.atlas.find("cheetah-x-bradar_p2"))
                       .size(si)
                      .padLeft(left)
                      .padTop(top);               
                } else {
                	iconTable.image(Core.atlas.find("cheetah-x-bradar_p3"))
                      .size(si)
                      .padLeft(left)
                      .padTop(top);                
                }
                
                                      iconTable.image(Core.atlas.find("cheetah-x-bradar-name"))
                      .size(si,siy)
                      .padLeft(left - 200)
                      .padTop(top + 245);
            }else if (playerUnit.type != null && playerUnit.type.name.endsWith("cheetah-x-keven_u")) {
                
                // استخدام نفس الأمر مباشرة داخل الجدول
 if (phoValue == 0)
                {
                iconTable.image(Core.atlas.find("cheetah-x-keven_u_p"))
                        .size(si)
                      .padLeft(left)
                      .padTop(top);              
                } else if (phoValue == 1){
                iconTable.image(Core.atlas.find("cheetah-x-keven_u_p2"))
                       .size(si)
                      .padLeft(left)
                      .padTop(top);               
                } else {
                	iconTable.image(Core.atlas.find("cheetah-x-keven_u_p3"))
                      .size(si)
                      .padLeft(left)
                      .padTop(top);                
                }
                                      iconTable.image(Core.atlas.find("cheetah-x-keven_u-name"))
                      .size(si,siy)
                      .padLeft(left - 200)
                      .padTop(top + 245);
            }else if (playerUnit.type != null && playerUnit.type.name.endsWith("cheetah-x-jeen")) {
                
                // استخدام نفس الأمر مباشرة داخل الجدول
 if (phoValue == 0)
                {
                iconTable.image(Core.atlas.find("cheetah-x-jeen_p"))
                        .size(si)
                      .padLeft(left)
                      .padTop(top);              
                } else if (phoValue == 1){
                iconTable.image(Core.atlas.find("cheetah-x-jeen_p2"))
                       .size(si)
                      .padLeft(left)
                      .padTop(top);               
                } else {
                	iconTable.image(Core.atlas.find("cheetah-x-jeen_p3"))
                      .size(si)
                      .padLeft(left)
                      .padTop(top);                
                }
                                      iconTable.image(Core.atlas.find("cheetah-x-jeen-name"))
                      .size(si,siy)
                      .padLeft(left - 200)
                      .padTop(top + 245);
            }else if (playerUnit.type != null && playerUnit.type.name.endsWith("cheetah-x-lora_queen")) {
                
 if (phoValue == 0)
                {
                iconTable.image(Core.atlas.find("cheetah-x-lora_queen_p"))
                        .size(si)
                      .padLeft(left)
                      .padTop(top);              
                } else if (phoValue == 1){
                iconTable.image(Core.atlas.find("cheetah-x-lora_queen_p2"))
                       .size(si)
                      .padLeft(left)
                      .padTop(top);               
                } else {
                	iconTable.image(Core.atlas.find("cheetah-x-lora_queen_p3"))
                      .size(si)
                      .padLeft(left)
                      .padTop(top);                
                }
                
                                      iconTable.image(Core.atlas.find("cheetah-x-para-name"))
                      .size(si,siy)
                      .padLeft(left - 200)
                      .padTop(top + 245);
            }else if(playerUnit.type != null && playerUnit.type.name.endsWith("cheetah-x-asia")) {
                
                // استخدام نفس الأمر مباشرة داخل الجدول
                if (phoValue == 0)
                {
                iconTable.image(Core.atlas.find("cheetah-x-asia_p"))
                        .size(si)
                      .padLeft(left)
                      .padTop(top);              
                } else if (phoValue == 1){
                iconTable.image(Core.atlas.find("cheetah-x-asia_p2"))
                       .size(si)
                      .padLeft(left)
                      .padTop(top);               
                } else {
                	iconTable.image(Core.atlas.find("cheetah-x-asia_p3"))
                      .size(si)
                      .padLeft(left)
                      .padTop(top);                
                }
                                      iconTable.image(Core.atlas.find("cheetah-x-asia-name"))
                      .size(si,siy)
                      .padLeft(left - 200)
                      .padTop(top + 245);
                      
                      
            }else if(playerUnit.type != null && playerUnit.type.name.endsWith("cheetah-x-lisa")) {
                
                // استخدام نفس الأمر مباشرة داخل الجدول
                if (phoValue == 0)
                {
                iconTable.image(Core.atlas.find("cheetah-x-lisa_p"))
                        .size(si)
                      .padLeft(left)
                      .padTop(top);              
                } else if (phoValue == 1){
                iconTable.image(Core.atlas.find("cheetah-x-lisa_p2"))
                       .size(si)
                      .padLeft(left)
                      .padTop(top);               
                } else {
                	iconTable.image(Core.atlas.find("cheetah-x-lisa_p3"))
                      .size(si)
                      .padLeft(left)
                      .padTop(top);                
                }
                                      iconTable.image(Core.atlas.find("cheetah-x-Plisa-name"))
                      .size(si,siy)
                      .padLeft(left - 200)
                      .padTop(top + 245);
            }
            }
      
        }
        }
    });

    Core.scene.add(iconTable);
});
