class Cup {
    constructor(posx, posy) {
        this.x = posx;
        this.y = posy;
    }
    x;
    y;
    hit = false;
    width=75;
    height=99;

    hitBounds = {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
    };
}