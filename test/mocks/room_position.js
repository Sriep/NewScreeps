/**
 * @fileOverview screeps
 * Created by piers on 06/06/2020
 * @author Piers Shepperson
 */

function Room_position(x, y, roomName) {
    this.x = x;
    this.y = y;
    this.roomName = roomName;
}

Room_position.prototype.isEqualTo= function(xOrtarget, y) {
    let x;
    if (y === undefined) {
        if (xOrtarget.x && xOrtarget.y) {
            x = xOrtarget.x;
            y = xOrtarget.y
        } else {
            x = xOrtarget.pos.x;
            y = xOrtarget.pos.y
        }
    } else {
        x = xOrtarget
    }
    return this.x === x && this.y === y;
};

Room_position.prototype.getRangeTo= function(xOrtarget, y) {
    let x;
    if (y === undefined) {
        if (xOrtarget.x && xOrtarget.y) {
            x = xOrtarget.x;
            y = xOrtarget.y
        } else {
            x = xOrtarget.pos.x;
            y = xOrtarget.pos.y
        }
    } else {
        x = xOrtarget
    }
    return Math.max( Math.abs(this.x-x), Math.abs(this.y-y));
};

Room_position.prototype.inRangeTo= function(xOrtarget, yOrRange, range) {
    let x,y;
    if (range) {
        x = xOrtarget;
        y = yOrRange;
    } else {
        range = yOrRange;
        if (xOrtarget.x && xOrtarget.y) {
            x = xOrtarget.x;
            y = xOrtarget.y
        } else {
            x = xOrtarget.pos.x;
            y = xOrtarget.pos.y
        }
    }
    return Math.max( Math.abs(this.x-x), Math.abs(this.y-y)) <= range;
};
module.exports = Room_position;