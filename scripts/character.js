var active = false;
var editorMenuTable1; // جدول الزر الأول
var editorMenuTable2; // جدول الزر الثاني
var phoValue = 0; // متغير عالمي ومؤقت يبدأ من الصفر

// --- دالة إنشاء وتحديد إحداثيات الأزرار ---
function createEditorMenus() {
    
let menu1 = new Table();
menu1.setFillParent(true); // يجعل الجدول يمتد على كامل الشاشة لتفعيل المحاذاة بدقة
menu1.top().left();       // محاذاة العناصر إلى الأعلى واليسار

menu1.table(Tex.pane, t => {
    let iconPho = new TextureRegionDrawable(Icon.add);
    
    let bPho = new Button(Styles.none);
    bPho.button(iconPho, () => { phoValue = 0; });
    t.add(bPho).size(50, 50).padBottom(20); // <--- إضافة مسافة من الأسفل
    t.row();
    
    let bPho2 = new Button(Styles.none);
    bPho2.button(iconPho, () => { phoValue = 1; });
    t.add(bPho2).size(50, 50).padBottom(20); // <--- إضافة مسافة من الأسفل
    t.row();
    
    let bPho3 = new Button(Styles.none);
    bPho3.button(iconPho, () => { phoValue = 2; });
    t.add(bPho3).size(50, 50); // الزر الأخير لا يحتاج مسافة تحته
});



menu1.visibility = () => {
    return Vars.ui.hudfrag.shown && 
           !Vars.ui.consolefrag.shown() && 
           !Vars.ui.minimapfrag.shown() && 
           !Vars.net.client();
};


    // --- 2. الزر الثاني (زر وضع التحرير) ---
    let menu2 = new Table();
    menu2.bottom().left();
    
    menu2.table(Tex.pane, t => {
        let bEdit = new Button(Styles.none);
        let iconEdit = new TextureRegionDrawable(Blocks.switchBlock.uiIcon);
        bEdit.button(iconEdit, () => {
            if (Vars.net.client()) return;
            active = !active;
            Vars.state.rules.editor = active;
        });
        t.add(bEdit).size(50, 50);
    });

    menu2.visibility = () => {
        return Vars.ui.hudfrag.shown && 
               !Vars.ui.consolefrag.shown() && 
               !Vars.ui.minimapfrag.shown() && 
               !Vars.net.client();
    };

    // إرجاع كلا الجدولين في مصفوفة أو كائن للتحكم بهم
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
                iconTable.image(Core.atlas.find("cheetah-x-bradar_p"))
                      .size(si)
                      .padLeft(left)
                      .padTop(top);
                                      iconTable.image(Core.atlas.find("cheetah-x-bradar-name"))
                      .size(si,siy)
                      .padLeft(left - 200)
                      .padTop(top + 245);
            }else if (playerUnit.type != null && playerUnit.type.name.endsWith("cheetah-x-keven_u")) {
                
                // استخدام نفس الأمر مباشرة داخل الجدول
                iconTable.image(Core.atlas.find("cheetah-x-keven_u_p"))
                      .size(si)
                      .padLeft(left)
                      .padTop(top);
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
                
                // استخدام نفس الأمر مباشرة داخل الجدول
                iconTable.image(Core.atlas.find("cheetah-x-lora_queen_p"))
                      .size(si)
                      .padLeft(left)
                      .padTop(top);
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
                iconTable.image(Core.atlas.find("cheetah-x-lisa_p"))
                      .size(si)
                      .padLeft(left)
                      .padTop(top);
                                      iconTable.image(Core.atlas.find("cheetah-x-Plisa-name"))
                      .size(si,siy)
                      .padLeft(left - 200)
                      .padTop(top + 245);
            }
      
        }
        }
    });

    Core.scene.add(iconTable);
});
