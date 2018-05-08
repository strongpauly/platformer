import * as React from 'react';
import * as Constants from './Constants';
import { IPosition } from './IPosition';
import './Player.css';

export interface IPlayer extends IPosition {
    inverted: boolean;
    jumping: boolean;
}

export class Player extends React.Component<IPlayer> {

    public render() {
        const style = {
            bottom: this.props.y,
            height: Constants.PLAYER_HEIGHT,
            left: this.props.x,
            width: Constants.PLAYER_WIDTH,
        }
        let className = "player";
        let animation = 0;
        if (this.props.x % Constants.STEP_WIDTH !== 0) {
            animation = Math.floor(this.props.x % Constants.STEP_WIDTH / (Constants.STEP_FRAMES + 1));
            if (this.props.inverted) {
                animation = Math.abs(Constants.STEP_FRAMES - 1 - animation);
            }
            className += ' player-run-' + animation;
        }
        if (this.props.inverted) {
            className += " inverted";
        }
        return (
        <div className={className} style={style}/>
        );
    }
}