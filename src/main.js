let global = {
    con: null,
    cli: null,
    userid: null,
    cupCount: 0,
    myturn: true,
    u: null,
    p: null,
    cuid: null, 
    shots: 0,
    hit: 0
};

let cups = [];
let opcups = [];

let game = {
    isGuest: false,
    inMatch: false,
    isSpectator: false,
    turn: false
};

let images = {
    ball: new Image(),
    cup: new Image(),
    table: new Image()
};

function preloadImages() {
    images.ball.src = 'img/ball.png';
    images.cup.src = 'img/cupshadow.png';
    images.table.src = 'img/table.png';
}

function initCups(numCups) {
    global.cupCount = numCups;
    let firstX = 400 - ((new Cup(0, 0).width * 4) / 2);
    let yFact = (new Cup(0, 0).height / 4) + 3;
    for (let i = 0; i < numCups; i++) {
        cups.push(new Cup(10, 10));
        if (i < 4) {
            if (i == 0) {
                cups[0].x = firstX;
                cups[0].y = 10;
            } else {
                cups[i].x = cups[i - 1].x + cups[0].width;
                cups[i].y = cups[0].y;
            }
        } else if (i >= 4 && i < 7) {
            cups[i].x = (firstX + (cups[0].width / 2)) + (cups[0].width * (i - 4));
            cups[i].y = cups[0].y + yFact;
        } else {
            switch(i) {
                case 7:
                    cups[7].x = cups[1].x;
                    cups[7].y = cups[1].y + (2 * yFact);
                    break;
                case 8:
                    cups[8].x = cups[2].x;
                    cups[8].y = cups[2].y + (2 * yFact);
                    break;
                case 9:
                    cups[9].x = cups[5].x;
                    cups[9].y = cups[5].y + (2 * yFact);
                    break;
            }
        }
        cups[i].hitBounds.left = cups[i].x + 3;
        cups[i].hitBounds.right = cups[i].x + cups[i].width - 3;
        cups[i].hitBounds.top = cups[i].y + 3;
        cups[i].hitBounds.bottom = cups[i].y + 24.5;
    }
    let cupMult = 1.3; //multiplier for how much bigger the closer cups to user pov are
    firstX = 400 - (((new Cup(0, 0).width * cupMult) * 4) / 2);
    yFact = ((new Cup(0, 0).height * cupMult) / 4) + 3;
    for (let i = 0; i < cups.length; i++) {
        opcups.push(new Cup(0, 0));
        opcups[i].width *= cupMult;
        opcups[i].height *= cupMult;
        if (i < 4) {
            if (i == 0) {
                opcups[0].x = firstX;
                opcups[0].y = (800 - opcups[0].height) - 40;
            } else {
                opcups[i].x = opcups[i - 1].x + opcups[0].width;
                opcups[i].y = opcups[0].y;
            }
        } else if (i >= 4 && i < 7) {
            opcups[i].x = (firstX + (opcups[0].width / 2)) + (opcups[0].width * (i - 4));
            opcups[i].y = opcups[0].y - yFact;
        } else {
            switch(i) {
                case 7:
                    opcups[7].x = opcups[1].x;
                    opcups[7].y = opcups[1].y - (2 * yFact);
                    break;
                case 8:
                    opcups[8].x = opcups[2].x;
                    opcups[8].y = opcups[2].y - (2 * yFact);
                    break;
                case 9:
                    opcups[9].x = opcups[5].x;
                    opcups[9].y = opcups[5].y - (2 * yFact);
                    break;
            }
        }
    }
}

function renderCups() {
    let n = global.cupCount - 1;
    var canvas = document.getElementById('gameCanvas');
    var ctx = canvas.getContext('2d');
    
    ctx.drawImage(images.table, 0, 0, 800, 800);
    for (var i = 0; i < cups.length; i++) {
        if (!cups[i].hit) {
            ctx.drawImage(images.cup, cups[i].x, cups[i].y, cups[i].width, cups[i].height);
        }
        if (!opcups[i].hit) {
            ctx.drawImage(images.cup, opcups[n - i].x, opcups[n - i].y, opcups[n - i].width, opcups[n - i].height);
        }
    }
}

