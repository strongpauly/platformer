import * as React from 'react';
import './Player.css';

export class Player extends React.Component<{x: number, y: number}> {
    

    public render() {
        const style = {
            bottom: this.props.y,
            left: this.props.x * 20
        }
        return (
        <div className="player" style={style}/>
        );
    }
}