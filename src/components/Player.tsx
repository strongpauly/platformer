import * as React from 'react';
import * as Constants from './Constants';
import { IPosition } from './IPosition';
import './Player.css';

export interface IPlayer extends IPosition {
    inverted: boolean;
    jumping: boolean;
    jumpStart: number;
    falling: boolean;
}

export class Player extends React.Component<IPlayer> {

    public render() {
        const style = {
            bottom: this.props.y,
            height: Constants.PLAYER_HEIGHT,
            left: this.props.x,
            width: Constants.PLAYER_WIDTH,
        }
        const classNames = ["player"];
        let animation = 0;
        if (this.props.jumping) {
            const now = Date.now();
            const percent = (now - this.props.jumpStart)/Constants.JUMP_TIME;
            if (percent <= 0.33) {
                classNames.push("jumping-up");
            } else if(percent <= 0.66) {
                classNames.push("jumping-apex");
            } else {
                classNames.push("jumping-down");
            }
        } else if (this.props.falling){
            classNames.push('jumping-down');
        } else if (this.props.x % Constants.STEP_WIDTH !== 0) {
            animation = Math.floor(this.props.x % Constants.STEP_WIDTH / (Constants.STEP_FRAMES + 1));
            if (this.props.inverted) {
                animation = Math.abs(Constants.STEP_FRAMES - 1 - animation);
            }
            classNames.push('player-run-' + animation);
        }
        if (this.props.inverted) {
            classNames.push("inverted");
        }
        return (
        <div className={classNames.join(" ")} style={style}/>
        );
    }
}