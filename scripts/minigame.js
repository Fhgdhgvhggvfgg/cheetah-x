var activeMiniGameMenu = null;
var activeMiniGameState = {
    activeGame: null,
    isMenuHiddenForGame: false
};

function setMinigameMenuVisible(visible) {
    if (activeMiniGameMenu == null || activeMiniGameMenu.parent == null) {
        if (visible) {
            openMinigameMenu();
        }
        return;
    }
    activeMiniGameMenu.visible = visible;
    activeMiniGameState.isMenuHiddenForGame = !visible;
}

function closeMinigameMenu() {
    if (activeMiniGameMenu != null) {
        try {
            activeMiniGameMenu.remove();
        } catch (e) {}
        activeMiniGameMenu = null;
        activeMiniGameState.isMenuHiddenForGame = false;
    }
}




function startLaneDodgeGame() {
    activeMiniGameState.activeGame = "laneDodge";
    try {
        setMinigameMenuVisible(false);
    } catch (e) {}

    const rows = 8; // 8 صفوف عمودية (0 في الأعلى إلى 7 في الأسفل)
    const cols = 3; // 3 مسارات أفقية (0: يسار، 1: وسط، 2: يمين)

    let playerCol = 1;
    let reds = []; // بدون حد أقصى: يسمح بـ 2 أو 3 أو أكثر في الساحة بنفس الوقت
    let score = 0;
    let lives = 3;
    let gameOver = false;
    let isClosed = false;
    let fallTask = null;
    let spawnTick = 0;

    let cellLabels = [];
    let statusLabel = null;

    const wrapper = new Table();
    wrapper.setFillParent(true);
    wrapper.center();

    const box = new Table(Tex.pane);
    box.add("[accent]3 Lanes x 8 Rows").pad(6).row();

    const infoTable = new Table();
    box.add(infoTable).padBottom(4).row();

    const body = new Table();
    box.add(body).pad(4).row();

    const controls = new Table();
    box.add(controls).padTop(6).row();

    const footer = new Table();
    box.add(footer).padTop(6);

    wrapper.add(box);
    Core.scene.add(wrapper);

    const isShown = () => !isClosed && wrapper != null && wrapper.parent != null;

    const setLabelSafe = (lbl, txt) => {
        if (lbl == null) return;
        try {
            lbl.setText(txt);
        } catch (e) {
            try { lbl.text = txt; } catch (e2) {}
        }
    };

    const stopLoop = () => {
        if (fallTask != null) {
            try { fallTask.cancel(); } catch (e) {}
            fallTask = null;
        }
    };

    const closeGame = () => {
        if (isClosed) return;
        isClosed = true;
        gameOver = true;
        stopLoop();
        try {
            if (wrapper != null) wrapper.remove();
        } catch (e) {}
        activeMiniGameState.activeGame = null;
        try {
            setMinigameMenuVisible(true);
        } catch (e) {}
    };

    const hasRedAt = (r, c) => {
        for (let i = 0; i < reds.length; i++) {
            if (reds[i].r === r && reds[i].c === c) return true;
        }
        return false;
    };

    const getCellText = (r, c) => {
        const isBottomRow = r === rows - 1;
        const isBlue = isBottomRow && c === playerCol;
        const isRed = hasRedAt(r, c);

        if (isBlue && isRed) return "[yellow]■■";
        if (isBlue) return "[cyan]■■";
        if (isRed) return "[scarlet]■■";
        return "[darkgray]·";
    };

    const updateStatus = () => {
        const stateText = gameOver ? "  [red]GAME OVER" : "";
        setLabelSafe(statusLabel, "[accent]Score: [white]" + score + "   [scarlet]Lives: [white]" + lives + stateText);
    };

    const renderBoard = () => {
        if (!isShown()) return;
        try {
            updateStatus();
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    if (cellLabels[r] && cellLabels[r][c]) {
                        setLabelSafe(cellLabels[r][c], getCellText(r, c));
                    }
                }
            }
        } catch (e) {}
    };

    const applyHit = () => {
        lives--;
        if (lives <= 0) {
            lives = 0;
            gameOver = true;
            stopLoop();
        }
    };

    const spawnRedIfFree = () => {
        const freeCols = [];
        for (let c = 0; c < cols; c++) {
            if (!hasRedAt(0, c)) {
                freeCols.push(c);
            }
        }
        if (freeCols.length > 0) {
            const chosenCol = freeCols[Math.floor(Math.random() * freeCols.length)];
            reds.push({ r: 0, c: chosenCol });
        }
    };

    const stepDown = () => {
        if (gameOver || !isShown()) return;

        // 1) تحريك جميع المربعات الحمراء الموجودة صفاً واحداً للأسفل (بأي عدد كان)
        for (let i = 0; i < reds.length; i++) {
            reds[i].r += 1;
        }

        // 2) معالجة من تجاوز الصف الأخير (الأسفل)
        const activeReds = [];
        for (let i = 0; i < reds.length; i++) {
            const item = reds[i];
            if (item.r >= rows) {
                if (item.c === playerCol) {
                    applyHit();
                } else {
                    score++;
                }
            } else {
                activeReds.push(item);
            }
        }
        reds = activeReds;

        if (gameOver) {
            renderBoard();
            return;
        }

        // 3) توليد مربع أحمر جديد في الأعلى في كل خطوة دون تقييد بعدد المربعات النشطة
        spawnTick++;
        if (spawnTick % 1 === 0) {
            spawnRedIfFree();
        }

        renderBoard();
    };

    const movePlayer = (deltaCol) => {
        if (gameOver || !isShown()) return;
        const nextCol = playerCol + deltaCol;
        if (nextCol < 0 || nextCol >= cols) return;

        playerCol = nextCol;

        for (let i = 0; i < reds.length; i++) {
            if (reds[i].r === rows - 1 && reds[i].c === playerCol) {
                reds.splice(i, 1);
                applyHit();
                break;
            }
        }

        renderBoard();
    };

    const startFallLoop = () => {
        stopLoop();
        fallTask = Timer.schedule(() => {
            if (!isShown() || gameOver) {
                stopLoop();
                return;
            }
            stepDown();
        }, 0.20, 0.20);
    };

    const buildUI = () => {
        infoTable.clear();
        statusLabel = infoTable.add("").get();

        body.clear();
        cellLabels = [];

        const gridTable = new Table();
        for (let r = 0; r < rows; r++) {
            const rowLbls = [];

            if (r > 0) {
                for (let c = 0; c < cols; c++) {
                    gridTable.add("[gray]────").pad(0);
                    if (c < cols - 1) {
                        gridTable.add("[gray]┼").pad(0);
                    }
                }
                gridTable.row();
            }

            for (let c = 0; c < cols; c++) {
                const lbl = gridTable.add(getCellText(r, c)).size(48, 28).pad(1).get();
                rowLbls.push(lbl);

                if (c < cols - 1) {
                    gridTable.add("[gray]│").pad(0);
                }
            }
            gridTable.row();
            cellLabels.push(rowLbls);
        }
        body.add(gridTable);

        controls.clear();
        controls.button("< Left", () => movePlayer(-1)).size(180, 84).padRight(12);
        controls.button("Right >", () => movePlayer(1)).size(180, 84);

        footer.clear();
        footer.button("Restart", () => resetGame()).size(110, 40).padRight(8);
        footer.button("Close", () => closeGame()).size(110, 40);
    };

    const resetGame = () => {
        if (isClosed) return;
        stopLoop();
        playerCol = 1;
        reds = [{ r: 0, c: Math.floor(Math.random() * cols) }];
        score = 0;
        lives = 3;
        gameOver = false;
        spawnTick = 0;

        renderBoard();
        startFallLoop();
    };

    buildUI();
    resetGame();
}












function openImageGallery() {
    activeMiniGameState.activeGame = "gallery";
    setMinigameMenuVisible(false);

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
        "excavator_S-photo"
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
        activeMiniGameState.activeGame = null;
        setMinigameMenuVisible(true);
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
        const cols = 3;

        for (let i = 0; i < imageList.length; i++) {
            let imgName = imageList[i].trim();
            let tex = Core.atlas.find("cheetah-x-" + imgName);

            p.table(Tex.button, card => {
                card.image(tex).size(110, 110).scaling(Scaling.fit).pad(4).row();
                card.add(imgName).padBottom(2);

                card.clicked(() => {
                    openPreview(imgName, tex);
                });
            }).pad(5);

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
    activeMiniGameState.activeGame = "quickRush";
    setMinigameMenuVisible(false);

    const colors = [
        { name: "■■■\n■■■\n■■■", tag: "[scarlet]" },
        { name: "■■■\n■■■\n■■■", tag: "[cyan]" },
        { name: "■■■\n■■■\n■■■", tag: "[lime]" },
        { name: "■■■\n■■■\n■■■", tag: "[gold]" }
    ];

    let score = 0;
    let timeLeft = 15;
    let targetColor = 0;
    let task = null;
    let grid = [];
    let isRoundOver = false;

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
        if (task != null) {
            try { task.cancel(); } catch (e) {}
            task = null;
        }
    };

    const close = () => {
        isRoundOver = true;
        stop();
        try { wrapper.remove(); } catch (e) {}
        activeMiniGameState.activeGame = null;
        setMinigameMenuVisible(true);
    };

    const refill = () => {
        grid = [];
        for (let i = 0; i < 9; i++) {
            grid.push(Math.floor(Math.random() * colors.length));
        }
        targetColor = grid[Math.floor(Math.random() * 9)];
    };

    const render = () => {
        if (!isShown()) return;
        body.clear();
        body.add("[accent]Score: [white]" + score + "   [scarlet]Time: [white]" + timeLeft + "s").padBottom(4).row();
        body.add(colors[targetColor].tag + colors[targetColor].name).padBottom(6).row();
        body.table(cons(t => {
            for (let i = 0; i < 9; i++) {
                const cellColor = grid[i];
                const c = colors[cellColor];
                const block4 = c.tag + "■■■\n" + c.tag + "■■■\n" + c.tag + "■■■";
                t.button(block4, () => {
                    if (isRoundOver || timeLeft <= 0) return;
                    if (cellColor === targetColor) {
                        score += 5;
                        refill();
                        render();
                    } else {
                        score = Math.max(0, score - 3);
                        timeLeft = Math.max(0, timeLeft - 1);
                        if (timeLeft <= 0) {
                            isRoundOver = true;
                            stop();
                        }
                        render();
                    }
                }).size(78, 78).pad(3);
                if ((i + 1) % 3 === 0) t.row();
            }
        }));
    };

    const reset = () => {
        stop();
        score = 0;
        timeLeft = 15;
        isRoundOver = false;
        refill();
        render();
        task = Timer.schedule(() => {
            if (!isShown()) {
                stop();
                return;
            }
            if (isRoundOver) {
                stop();
                return;
            }
            timeLeft--;
            if (timeLeft <= 0) {
                timeLeft = 0;
                isRoundOver = true;
                stop();
                render();
                Vars.ui.showInfo("Time's up! Final Score: " + score);
                return;
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
    activeMiniGameState.activeGame = "grid";
    setMinigameMenuVisible(false);

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
            try { moveTask.cancel(); } catch (e) {}
            moveTask = null;
        }
    }

    function closeGame() {
        gameOver = true;
        stopLoop();
        try { wrapper.remove(); } catch (e) {}
        activeMiniGameState.activeGame = null;
        setMinigameMenuVisible(true);
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

        if (!gameOver && isShown()) {
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
        let safetyCounter = 0;
        const maxAttempts = size * size * 4;

        while (!valid && safetyCounter < maxAttempts) {
            safetyCounter++;
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

        if (!valid) {
            for (let y = 0; y < size; y++) {
                for (let x = 0; x < size; x++) {
                    let occupied = false;
                    for (let i = 0; i < excludeList.length; i++) {
                        if (excludeList[i].x === x && excludeList[i].y === y) {
                            occupied = true;
                            break;
                        }
                    }
                    if (!occupied) return { x: x, y: y };
                }
            }
        }

        return { x: nx, y: ny };
    }

    function resetGame() {
        stopLoop();
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

function openMinigameMenu() {
    try {
        if (activeMiniGameMenu != null && activeMiniGameMenu.parent != null) {
            activeMiniGameMenu.visible = true;
            activeMiniGameState.isMenuHiddenForGame = false;
            return;
        }

        closeMinigameMenu();

        var wrapper = new Table();
        wrapper.setFillParent(true);
        wrapper.center();

        var box = new Table(Tex.pane);
        box.add("[accent]MiniGames Menu").pad(8).row();

        box.button("snack game", function() {
            setMinigameMenuVisible(false);
            startGridGame();
        }).size(220, 56).pad(6).row();

        box.button("box colors game", function() {
            setMinigameMenuVisible(false);
            startQuickRushGame();
        }).size(220, 56).pad(6).row();

        box.button("car", function() {
            setMinigameMenuVisible(false);
            startLaneDodgeGame();
        }).size(220, 56).pad(6).row();
        
                box.button("photos studio", function() {
            setMinigameMenuVisible(false);
            openImageGallery();
        }).size(220, 56).pad(6).row();

        box.button("Close", function() {
            activeMiniGameState.activeGame = null;
            closeMinigameMenu();
        }).size(160, 48).padTop(8);

        wrapper.add(box);
        Core.scene.add(wrapper);
        activeMiniGameMenu = wrapper;
        activeMiniGameState.isMenuHiddenForGame = false;
    } catch (e) {
        Vars.ui.showInfo("Error: " + e);
    }
}

module.exports = {
    openMenu: openMinigameMenu,
    closeMenu: closeMinigameMenu,
    setMenuVisible: setMinigameMenuVisible
};
