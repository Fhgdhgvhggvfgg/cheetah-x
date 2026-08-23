        Events.on(ClientLoadEvent, e => {
          Vars.ui.settings.addCategory("JSM", Icon.file, cons(t => {
            
            // чек бокс
            t.check("Initial Message", Core.settings.getBool("mess", true), v => {
              Core.settings.put("mess", v);
              print(v ? "on" : "off");
            }).left().row();
            
            t.add("[gray]You can change it by replacing the file /sprites/welcome_logo.png").left().padLeft(35).row(); //.row() тепер не отдельна функція
            
            t.check("Show Tile Name", Core.settings.getBool("ISN", true), v => {
              Core.settings.put("ISN", v);
              print(v ? "on" : "off");
            }).left().row();
            
            t.add("[gray]Show tile block name in Inspector \n(does not apply to console)").left().padLeft(35).row();
            
            t.check("Show Dev Menu", Core.settings.getBool("SDM", false), v => {
              Core.settings.put("SDM", v);
              SetApl()
            }).left().row();
            
            t.add("[gray]The changes will be applied after restarting the game").left().padLeft(35).row();
            
            // кнопка з інонкою "і", текстом, для простої кнопки з  текстом: не вказувати параметер Icon
            t.button("content", Icon.info, () => {
              // те що робить кніпка
              showCont()
                  //розмір, відступи, та "ентер"
            }).center().padTop(20).size(200, 50).row();
            
          }));
          
          //контентовий діалог
          function showCont() {
           const con = new BaseDialog("mod content");
    
           con.cont.pane(p => {
    
            p.button("r0uter", new TextureRegionDrawable(Core.atlas.find("jsm-r0uter")), () => {
                const rou = Vars.content.block("jsm-r0uter");
                if (rou) Vars.ui.content.show(rou);
            }).size(210, 64).padTop(10).row();;
    
            p.button("feedbacker", new TextureRegionDrawable(Core.atlas.find("jsm-feedbacker")), () => {
                const b = Vars.content.block("jsm-feedbacker");
                if (b) Vars.ui.content.show(b);
            }).size(210, 64).padTop(10).row();
    
            p.button("VarWall", new TextureRegionDrawable(Core.atlas.find("jsm-VarWall")), () => {
                const VW = Vars.content.block("jsm-VarWall");
                if (VW) Vars.ui.content.show(VW);
            }).size(210, 64).padTop(10).row();
    
            p.button("Inspector", new TextureRegionDrawable(Core.atlas.find("jsm-Inspector")), () => {
                const INSP = Vars.content.block("jsm-Inspector");
                if (INSP) Vars.ui.content.show(INSP);
            }).size(210, 64).padTop(10).row();
    
            p.button("menu", new TextureRegionDrawable(Core.atlas.find("jsm-menu")), () => {
                const menu = Vars.content.block("jsm-menu");
                if (menu) Vars.ui.content.show(menu);
            }).size(210, 64).padTop(10).row();
    
            p.button("tur", new TextureRegionDrawable(Core.atlas.find("jsm-tur")), () => {
                const tur = Vars.content.block("jsm-tur");
                if (tur) Vars.ui.content.show(tur);
            }).size(210, 64).padTop(10).row();
    
            p.button("sentry", new TextureRegionDrawable(Core.atlas.find("jsm-sentry")), () => {
                const sentry = Vars.content.block("jsm-sentry");
                if (sentry) Vars.ui.content.show(sentry);
            }).size(210, 64).padTop(10).row();
    
            p.button("dtek", new TextureRegionDrawable(Core.atlas.find("jsm-dtek")), () => {
                const dtek = Vars.content.block("jsm-dtek");
                if (dtek) Vars.ui.content.show(dtek);
            }).size(210, 128).padTop(10).row();
    
            p.button("pmd", new TextureRegionDrawable(Core.atlas.find("jsm-pmd")), () => {
                const pmd = Vars.content.block("jsm-pmd");
                if (pmd) Vars.ui.content.show(pmd);
            }).size(210, 128).padTop(10).row();
    
          }).size(260, 300);
    
            con.addCloseButton();
            con.show();
          }
          
          // діалогове вікно це функція щоб упростити код та виклик цього вікна
          //саме вікно:
// دالة عرض النافذة الترحيبية عند تشغيل اللعبة
          // دالة عرض النافذة الترحيبية عند تشغيل اللعبة
function showMyDialog() {
    const d = new BaseDialog("hello");
    
    d.cont.pane(p => {
        p.image(Core.atlas.find("cheetah-x-welcome_logo")).size(600, 600).pad(10).row();
        p.add("The mod will be ready soon. You just have to wait a little longer.").row();
        
        const studyTex = Core.atlas.find("cheetah-x-study");
        p.image(studyTex).size(600, 600).pad(10).row();
        p.add("How to collect gold.").row();
        
        const studyTex2 = Core.atlas.find("cheetah-x-study2");
        p.image(studyTex2).size(600, 600).pad(10).row();
        p.add("The way the game starts. py ram").row();
        
               const studyTex3 = Core.atlas.find("cheetah-x-study3");
        p.image(studyTex3).size(600, 600).pad(10).row();
        // ✅ إضافة زر الرابط هنا
        p.button("", Icon.link, () => Core.app.openURI("https://fhgdhgvhggvfgg.github.io/Cpe-cheetah-/warehouse/")).size(80, 80).padTop(-400).padLeft(-100).row();
        p.add("come to our page for the latest news").row();
    }).size(1000, 600);
    
    d.buttons.button("bye", () => d.hide()).size(210, 64);
    d.show();
}


          
          // Показ вікна якщо чекбокс активний
          if (Core.settings.getBool("mess", true)) {
            showMyDialog();
            //з викликом вікна яке тепер функція
          }
        });
        
        
    function blockmenu() {
        const M = new BaseDialog("hello");
    
        M.cont.button(new TextureRegionDrawable(Core.atlas.find("jsm-calc-icon")), () => {
            calc()
        }).size(60,60).padLeft(10).padRight(10);
        
        M.cont.button( new TextureRegionDrawable(Core.atlas.find("jsm-50-50-icon")), () => {
            
            if (Math.random() > 0.5) {
                Vars.ui.hudfrag.showToast(Icon.ok, "You Vin!");
            } else {
                Vars.ui.hudfrag.showToast(Icon.info, "You lost :(");
                
                Time.run(60 * 5, () => { Packages.arc.Core.app.exit() });
            }
            
        }).size(64, 64).center().row();
        
        M.buttons.button("back", () => {
            M.hide();
            Vars.ui.hudfrag.showToast(Icon.info, "bye!");
        }).size(210, 64);
        M.show();
    }
    
    //Dev Menu-----
    
    function DevMenu() {
       const DM = new BaseDialog("Dev Menu");
       DM.buttons.button("close", () => { DM.hide() }).size(150, 60).padBottom(20)
       DM.cont.button(Icon.production, () => { Resources() }).size(60, 60).pad(10)
       DM.show()
    }
    
    //Dev Menu/Resources-----
    
    function Resources() {
        const res = new BaseDialog("Resources");
        
        res.cont.pane(l => {
            
            l.button(new TextureRegionDrawable(Items.copper.uiIcon), () => { 
                
                let IC = resSlider.getValue()
                Vars.player.team().core().items.add(Items.copper, IC)
                
            }).size(60, 60)
            
            l.button(new TextureRegionDrawable(Items.lead.uiIcon), () => { 
                
                let IC = resSlider.getValue()
                Vars.player.team().core().items.add(Items.lead, IC)
                
            }).size(60, 60)
            
        }).row()
        
        let label = res.cont.add("0").colspan(3).center().get();
        res.cont.row()
        
        res.cont.button(Icon.cancel,  () => {
            
            var count = resSlider.getValue()
            count -=100 
            if (count < -10000) {
                count = -10000
            }
            resSlider.setValue(count);
            
        }).size(50,50).padRight(5)
        
        var resSlider
        
        resSlider = res.cont.slider(-10000, 10000, 1, 0, ReValue => {
            
        print("Значение: " + ReValue);
        
        label.setText("" + Math.floor(ReValue));
        
        }).width(300).get()
        
        res.cont.button(Icon.add,  () => {
            
            var count = resSlider.getValue()
            count +=100 
            if (count > 10000) {
                count = 10000
            }
            resSlider.setValue(count);
            
        }).size(50,50).padLeft(5).row()
    
        res.buttons.button("close", () => { res.hide() }).size(150, 60).padBottom(20)
        
        res.show()
        
    }
    
    //setting apply-----
    
    function SetApl() {
        const SA = new BaseDialog("exit game?");
        SA.cont.add("[red]restart the game to apply the changes?").row()
        SA.cont.button("No thanks", () => { SA.hide() }).size(140, 60).row()
        SA.cont.button("Ok", () => { Packages.arc.Core.app.exit() }).size(140, 60)
        SA.show()
    }
    
    //calculator-----
    
    function calc() {
        const cal = new BaseDialog("Calculator");
        
        cal.cont.add("[grey]Number 1").center().row()
        
        let label1 = cal.cont.add(new TextField("", Styles.defaultField)).width(200).get();
        label1.setFilter(TextField.TextFieldFilter.digitsOnly);
        
        cal.cont.row();
        
        cal.cont.add("[grey]Number 2").center().padTop(5).row()
        
        let label2 = cal.cont.add(new TextField("", Styles.defaultField)).width(200).get();
        label2.setFilter(TextField.TextFieldFilter.digitsOnly);
        
        cal.cont.row();
        
        cal.cont.table(cons(t => {
            
            t.button("+", () => {
            
            let num1 = parseInt(label1.getText());
            let num2 = parseInt(label2.getText());
            
            reslabel.setText((num1 + num2).toString())
            
        }).size(60, 60).padTop(3).padLeft(5).padRight(5).padBottom(3);
        
            t.button("-", () => {
            
            let num1 = parseInt(label1.getText());
            let num2 = parseInt(label2.getText());
            
            reslabel.setText((num1 - num2).toString())
            
        }).size(60, 60).padTop(3).padLeft(5).padRight(5).padBottom(3);
        
            t.button("*", () => {
            
            let num1 = parseInt(label1.getText());
            let num2 = parseInt(label2.getText());
            
            reslabel.setText((num1 * num2).toString())
            
        }).size(60, 60).padTop(3).padLeft(5).padRight(5).padBottom(3);
        
            t.button("/", () => {
            
                let num1 = parseInt(label1.getText());
                let num2 = parseInt(label2.getText());
            
            if (num2 == 0) {
                reslabel.setText("null")
            } else {
                reslabel.setText((num1 / num2).toString())
            };
            
        }).size(60, 60).padTop(3).padLeft(5).padRight(5).padBottom(3);
        
            t.button("%", () => {
            
            let num1 = parseInt(label1.getText());
            let num2 = parseInt(label2.getText());
            
            reslabel.setText((num1 % num2).toString())
            
        }).size(60, 60).padTop(3).padLeft(5).padRight(5).padBottom(3);
        
        })).center().row();
        
        let reslabel = cal.cont.add(new Label("Result")).width(200).center().get();
        reslabel.setAlignment(Align.center);
        
        cal.buttons.button(Icon.none, () => { 
            
            label1.setText("");
            label2.setText("");
            reslabel.setText("Result");
            
        }).size(64, 64).padLeft(5);
        
        cal.buttons.button("back", () => { cal.hide() }).size(210, 64);
        
        cal.buttons.button(Icon.copy, () => { Core.app.setClipboardText(reslabel.getText()) }).size(64, 64).padLeft(5);
        
        cal.show();
    }
    


    //export-----
    module.exports = {
       blockmenu: blockmenu,
       DevMenu: DevMenu,
       SetApl: SetApl,
    };
    