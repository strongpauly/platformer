import * as React from 'react';
import { IPlayer } from '../model/IPlayer';
import * as Constants from './Constants';
import './Player.css';

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
            if (this.props.jumpPercent <= 0.33) {
                classNames.push("jumping-up");
            } else if(this.props.jumpPercent <= 0.66) {
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