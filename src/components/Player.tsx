import * as React from 'react';
import { IShape } from './IShape';
import './Player.css';

export class Player extends React.Component<IShape> {

    public render() {
        const style = {
            bottom: this.props.y,
            left: this.props.x
        }
        return (
        <div className="player" style={style}/>
        );
    }
}