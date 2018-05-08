import * as React from 'react';
import './Player.css';

interface IPlayerProps {
    x: number; 
    y: number; 
}
export class Player extends React.Component<IPlayerProps> {

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