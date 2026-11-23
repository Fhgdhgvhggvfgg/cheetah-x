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

    const wrapper = new Table();
    wrapper.setFillParent(true);
    wrapper.center();

    const box = new Table(Tex.pane);
    box.add("[accent]Image Studio").pad(6).row();

    let previewBox = null;

    const closePreview = () => {
        if (previewBox != null) {
            try { previewBox.remove(); } catch (e) {}
            previewBox = null;
        }
    };

    const closeGallery = () => {
        closePreview();
        try { wrapper.remove(); } catch (e) {}
        openMinigameMenu();
    };


    const openPreview = (imgName, tex) => {
        closePreview();

        const pWrapper = new Table();
        pWrapper.setFillParent(true);
        pWrapper.center();

        const pBox = new Table(Tex.pane);
        pBox.add("[accent]" + imgName).pad(6).row();
        pBox.image(tex).size(600, 600).scaling(Scaling.fit).pad(8).row();
        pBox.button("Close", () => {
            closePreview();
        }).size(140, 44).padBottom(4);

        pWrapper.add(pBox);
        Core.scene.add(pWrapper);
        previewBox = pWrapper;
    };

    box.pane(p => {
        const cols = 3; // 3 صور في كل سطر

        for (let i = 0; i < imageList.length; i++) {
            let imgName = imageList[i].trim();
            // استدعاء الصورة مباشرة بالبادئة كما في character.js
            let tex = Core.atlas.find("cheetah-x-" + imgName);

            // بطاقة كل صورة
            p.table(Tex.button, card => {
                card.image(tex).size(110, 110).scaling(Scaling.fit).pad(4).row();
                card.add(imgName).padBottom(2);

                // النقر لعرض الصورة بحجم كبير في نافذة مصغرة
                card.clicked(() => {
                    openPreview(imgName, tex);
                });
            }).pad(5);

            // النزول إلى سطر جديد بعد كل 3 صور
            if ((i + 1) % cols === 0) {
                p.row();
            }
        }
    }).size(540, 380).row();

    box.button("Close", () => {
        closeGallery();
    }).size(160, 46).padTop(6);

    wrapper.add(box);
    Core.scene.add(wrapper);
}




function startQuickRushGame() {
    const colors = [
        { name: "■■■\n■■■\n■■■", tag: "[scarlet]" },
        { name: "■■■\n■■■\n■■■", tag: "[cyan]" },
        { name: "■■■\n■■■\n■■■", tag: "[lime]" },
        { name: "■■■\n■■■\n■■■", tag: "[gold]" }
    ];
    let score = 0, timeLeft = 15, targetColor = 0, task = null, grid = [];

    const wrapper = new Table();
    wrapper.setFillParent(true);
    wrapper.center();

    const box = new Table(Tex.pane);
    box.add("[accent]Quick Rush").pad(6).row();

    const body = new Table();
    box.add(body).pad(4).row();

    const footer = new Table();
    box.add(footer).padTop(6);

    wrapper.add(box);
    Core.scene.add(wrapper);

    const isShown = () => wrapper.parent != null;

    const stop = () => {
        if (task) {
            task.cancel();
            task = null;
        }
    };

    const close = () => {
        stop();
        try { wrapper.remove(); } catch (e) {}
        openMinigameMenu();
    };


    const refill = () => {
        grid = [];
        for (let i = 0; i < 9; i++) grid.push(Math.floor(Math.random() * colors.length));
        targetColor = grid[Math.floor(Math.random() * 9)];
    };

    const render = () => {
        if (!isShown()) return;
        body.clear();
        body.add("[accent]Score: [white]" + score + "   [scarlet]Time: [white]" + timeLeft + "s").padBottom(4).row();
        body.add(colors[targetColor].tag + colors[targetColor].name).padBottom(6).row();
        body.table(cons(t => {
            for (let i = 0; i < 9; i++) {
                const cellColor = grid[i], c = colors[cellColor];
                const block4 = c.tag + "■■■\n" + c.tag + "■■■\n" + c.tag + "■■■";
                t.button(block4, () => {
                    if (timeLeft <= 0) return;
                    if (cellColor === targetColor) { score += 5; refill(); render(); }
                    else { score = Math.max(0, score - 3); timeLeft = Math.max(0, timeLeft - 1); render(); }
                }).size(78, 78).pad(3);
                if ((i + 1) % 3 === 0) t.row();
            }
        }));
    };

    const reset = () => {
        stop();
        score = 0;
        timeLeft = 15;
        refill();
        render();
        task = Timer.schedule(() => {
            if (!isShown()) {
                stop();
                return;
            }
            timeLeft--;
            if (timeLeft <= 0) {
                timeLeft = 0;
                stop();
                Vars.ui.showInfo("Time's up! Final Score: " + score);
            }
            render();
        }, 1, 1);
    };

    footer.clear();
    footer.button("Restart", reset).size(115, 44).padRight(8);
    footer.button("Close", close).size(115, 44);

    reset();
}








function startGridGame() {
    const size = 7;
    let playerX = 3;
    let playerY = 3;
    let dirX = 0;
    let dirY = -1;
    let snakeTail = [];
    let pendingGrowth = 0;

    let starX = 1;
    let starY = 1;
    let mineX = 5;
    let mineY = 5;
    let score = 0;
    let lives = 3;
    let gameOver = false;
    let statusText = "Collect stars (*) and avoid mines (X)!";
    let moveTask = null;

    const wrapper = new Table();
    wrapper.setFillParent(true);
    wrapper.center();

    const box = new Table(Tex.pane);
    box.add("[accent]Grid Mini-Game").pad(6).row();

    const body = new Table();
    box.add(body).pad(4).row();

    const footer = new Table();
    box.add(footer).padTop(6);

    wrapper.add(box);
    Core.scene.add(wrapper);

    function isShown() {
        return wrapper.parent != null;
    }

    function stopLoop() {
        if (moveTask != null) {
            moveTask.cancel();
            moveTask = null;
        }
    }

    function closeGame() {
        stopLoop();
        try { wrapper.remove(); } catch (e) {}
        openMinigameMenu();
    }


    function startLoop() {
        stopLoop();
        moveTask = Timer.schedule(() => {
            if (!isShown() || gameOver) {
                if (!isShown()) stopLoop();
                return;
            }
            moveTo(playerX + dirX, playerY + dirY);
        }, 0.5, 0.5);
    }

    function setDirection(ndx, ndy) {
        if (gameOver || !isShown()) return;
        if (ndx === -dirX && ndy === -dirY) return;

        dirX = ndx;
        dirY = ndy;

        moveTo(playerX + dirX, playerY + dirY);

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
        snakeTail = [{ x: 3, y: 4 }];
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
        if (!isShown()) return;
        body.clear();

        body.add("[accent]Score: [white]" + score + "   [scarlet]Lives: [white]" + lives + "   [gray](" + playerX + "," + playerY + ")").row();
        body.add(statusText).padBottom(4).row();

        body.table(cons(grid => {
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

                    grid.add(label).size(34, 34).pad(1);
                }
                grid.row();
            }
        })).padBottom(6).row();

        body.table(cons(ctrl => {
            ctrl.add().size(64, 64).pad(2);
            ctrl.button("^", () => setDirection(0, -1)).size(64, 64).pad(2);
            ctrl.add().size(64, 64).pad(2);
            ctrl.row();

            ctrl.button("<", () => setDirection(-1, 0)).size(64, 64).pad(2);
            ctrl.add().size(64, 64).pad(2);
            ctrl.button(">", () => setDirection(1, 0)).size(64, 64).pad(2);
            ctrl.row();

            ctrl.add().size(64, 64).pad(2);
            ctrl.button("v", () => setDirection(0, 1)).size(64, 64).pad(2);
            ctrl.add().size(64, 64).pad(2);
        })).row();
    }

    footer.clear();
    footer.button("Restart", resetGame).size(115, 44).padRight(8);
    footer.button("Close", closeGame).size(115, 44);

    resetGame();
}



var activeMiniGameMenu = null;

function closeMinigameMenu() {
    if (activeMiniGameMenu != null) {
        try {
            activeMiniGameMenu.remove();
        } catch (e) {}
        activeMiniGameMenu = null;
    }
}

function openMinigameMenu() {
    try {
        closeMinigameMenu();

        var wrapper = new Table();
        wrapper.setFillParent(true);
        wrapper.center();

        var box = new Table(Tex.pane);
        box.add("[accent]MiniGames Menu").pad(8).row();

        box.button("snack game", function() {
            closeMinigameMenu();
            startGridGame();
        }).size(220, 56).pad(6).row();

        box.button("box colors game", function() {
            closeMinigameMenu();
            startQuickRushGame();
        }).size(220, 56).pad(6).row();

        box.button("photos studio", function() {
            closeMinigameMenu();
            openImageGallery();
        }).size(220, 56).pad(6).row();

        box.button("Close", function() {
            closeMinigameMenu();
        }).size(160, 48).padTop(8);

        wrapper.add(box);
        Core.scene.add(wrapper);
        activeMiniGameMenu = wrapper;
    } catch (e) {
        Vars.ui.showInfo("Error: " + e);
    }
}

module.exports = {
    openMenu: openMinigameMenu,
    closeMenu: closeMinigameMenu
};
