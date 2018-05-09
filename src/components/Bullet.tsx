import * as React from 'react';
import './Bullet.css';
import { IPosition } from './IPosition';

export class Bullet extends React.Component<IPosition> {
    public render() {
        const style = {
            bottom: this.props.y,
            left: this.props.x,
        }
        return (
            <div className="bullet" style={style}/>
        );
    }
}