let global = {
    con: null,
    cli: null,
    username: null
};

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
    images.cup.src = 'img/cup.png';
    images.table.src = 'img/table.png';
}

function renderCups() {

}

