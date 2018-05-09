import * as React from 'react';
import './Gun.css';
import { IPosition } from './IPosition';

export class Gun extends React.Component<IPosition> {
    public render() {
        const style = {
            bottom: this.props.y,
            left: this.props.x,
        }
        return (
        <div className="gun" style={style}/>
        );
    }
}