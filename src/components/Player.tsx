import * as React from 'react';
import { IShape } from './IShape';
import './Player.css';

export interface IPlayer extends IShape {
    inverted: boolean;
}

export class Player extends React.Component<IPlayer> {

    public render() {
        const style = {
            bottom: this.props.y,
            left: this.props.x
        }
        let className = "player";
        if (this.props.inverted) {
            className += " inverted";
        }
        return (
        <div className={className} style={style}/>
        );
    }
}