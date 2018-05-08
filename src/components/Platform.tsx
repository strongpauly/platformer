import * as React from 'react';
import { IShape } from './IShape';
import './Platform.css';

export class Platform extends React.Component<IShape> {
    public render() {
        const style = {
            bottom: this.props.y,
            height: this.props.height,
            left: this.props.x,
            width: this.props.width
        }
        return (
        <div className="platform" style={style}/>
        );
    }
}