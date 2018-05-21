import * as React from 'react';
import * as Constants from './Constants';
import { IPosition } from './IPosition';
import './Player.css';

export interface IPlayer extends IPosition {
    hp: number;
    inverted: boolean;
    invulnerable: boolean;
    jumping: boolean;
    jumpStart: number;
    falling: boolean;
    stepping: boolean;
    stepStart: number;
    hasGun: boolean;
}

export class Player extends React.Component<IPlayer> {

    public render() {
        const style = {
            bottom: this.props.y,
            height: Constants.PLAYER_HEIGHT,
            left: this.props.x,
            width: 30,
        }
        const classNames = ["player"];
        if(this.props.hasGun) {
            classNames.push('with-gun');
        }
        const now = Date.now();
        if (this.props.jumping) {
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
        } else if (this.props.stepping) {
            const animation = Math.floor((now - this.props.stepStart) / Constants.STEP_TIME % (Constants.STEP_FRAMES));
            classNames.push('player-run-' + animation);
        }
        if (this.props.inverted) {
            classNames.push("inverted");
        }
        if(this.props.invulnerable) {
            classNames.push("invulnerable")
        }
        return (
        <div className={classNames.join(" ")} style={style}/>
        );
    }
}