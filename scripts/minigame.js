function openImageGallery() {
    // مصفوفة أسماء الصور مباشرة بدون مسار وبدون .png (تماماً مثل character.js)
    const imageList = [
        "lora_queen_p3",
        "bradar_p3",
        "bradar_keven",
        "lora_shore",
        "jeen_p3",
        "lora_sleep",
        "jamaica_p2",
        "jeff_p3",
        "tank_girl-photo",
        "study3",
        "keven_night",
        "CCA_bus_power-photo",
        "jeff_p2",
        "valka_queen-photo",
        "jeff_bradar",
        "lora_keven",
        "pyramid-full",
        "lisa_p2",
        "par-photo",
        "aircraft_p-photo",
        "lisa_p3",
        "lora_p2",
        "keven_u-photo",
        "asia_p",
        "jeen_p2",
        "study3",
        "excavator_S-photo",
    ];

    const d = new BaseDialog("Image Studio");

    d.cont.pane(p => {
        const cols = 3; // 3 صور في كل سطر

        for (let i = 0; i < imageList.length; i++) {
            let imgName = imageList[i].trim();
            // استدعاء الصورة مباشرة بالبادئة كما في character.js
            let tex = Core.atlas.find("cheetah-x-" + imgName);

            // بطاقة كل صورة
            p.table(Tex.button, card => {
                card.image(tex).size(150, 150).scaling(Scaling.fit).pad(6).row();
                card.add(imgName).padBottom(4);

                // النقر لعرض الصورة بحجم كبير
                card.clicked(() => {
                    const view = new BaseDialog(imgName);
                    view.cont.image(tex).size(420, 420).scaling(Scaling.fit).pad(10).row();
                    view.buttons.button("Close", () => view.hide()).size(160, 60);
                    view.show();
                });
            }).pad(8);

            // النزول إلى سطر جديد بعد كل 3 صور
            if ((i + 1) % cols === 0) {
                p.row();
            }
        }
    }).size(700, 500);

    d.buttons.clear();
    d.buttons.button("Close", () => d.hide()).size(180, 60);

    d.show();
}




function startQuickRushGame() {
    const d = new BaseDialog("Quick Rush");
    const colors = [
        { name: "■■■\n■■■\n■■■", tag: "[scarlet]" },
        { name: "■■■\n■■■\n■■■", tag: "[cyan]" },
        { name: "■■■\n■■■\n■■■", tag: "[lime]" },
        { name: "■■■\n■■■\n■■■", tag: "[gold]" }
    ];
    let score = 0, timeLeft = 15, targetColor = 0, task = null, grid = [];
    const stop = () => { if (task) { task.cancel(); task = null; } };
    const refill = () => {
        grid = [];
        for (let i = 0; i < 9; i++) grid.push(Math.floor(Math.random() * colors.length));
        targetColor = grid[Math.floor(Math.random() * 9)];
    };
    const render = () => {
        d.cont.clear();
        d.cont.add("[accent]Score: [white]" + score + "   [scarlet]Time: [white]" + timeLeft + "s").row();
        d.cont.add(colors[targetColor].tag + colors[targetColor].name).padBottom(8).row();
        d.cont.table(cons(t => {
            for (let i = 0; i < 9; i++) {
                const cellColor = grid[i], c = colors[cellColor];
                const block4 = c.tag + "■■■\n" + c.tag + "■■■\n" + c.tag + "■■■";
                t.button(block4, () => {
                    if (timeLeft <= 0) return;
                    if (cellColor === targetColor) { score += 5; refill(); render(); }
                    else { score = Math.max(0, score - 3); timeLeft = Math.max(0, timeLeft - 1); render(); }
                }).size(130, 130).pad(4);
                if ((i + 1) % 3 === 0) t.row();
            }
        }));
    };
    const reset = () => {
        stop(); score = 0; timeLeft = 15; refill(); render();
        task = Timer.schedule(() => {
            if (!d.isShown()) return;
            timeLeft--;
            if (timeLeft <= 0) { timeLeft = 0; stop(); Vars.ui.showInfo("Time's up! Final Score: " + score); }
            render();
        }, 1, 1);
    };
    d.hidden(stop);
    d.buttons.clear();
    d.buttons.button("Restart", reset).size(150, 60).padRight(10);
    d.buttons.button("Close", () => { stop(); d.hide(); }).size(150, 60);
    reset();
    d.show();
}








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



function openMinigameMenu() {
    try {
        var d = new BaseDialog("MiniGames Menu");

        d.cont.button("snack game", function() {
startGridGame();
        }).size(260, 70).pad(10).row();

        d.cont.button("box colors game", function() {
startQuickRushGame();
        }).size(260, 70).pad(10).row();

        d.cont.button("photos studio", function() {
openImageGallery();
        }).size(260, 70).pad(10).row();

        d.buttons.clear();
        d.buttons.button("Close", function() {
            d.hide();
        }).size(180, 60);

        d.show();
    } catch (e) {
        Vars.ui.showInfo("Error: " + e);
    }
}

module.exports = {
    openMenu: openMinigameMenu
};
