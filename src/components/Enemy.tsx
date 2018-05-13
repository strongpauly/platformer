import * as React from 'react';
import * as Constants from './Constants';
import './Enemy.css';
import { IPosition } from './IPosition';

export class Enemy extends React.Component<any, any> {

    constructor(props: React.Props<IPosition>) {
        super(props);
    }
    
    public render() {
        const style = {
            bottom: this.props.y,
            height: Constants.ENEMY_HEIGHT,
            left: this.props.x,
            width: Constants.ENEMY_WIDTH
        }
        const classes = ['enemy'];
        if (this.props.inverted) {
            classes.push('inverted');
        }
        if (this.props.hit) {
            classes.push('hit');
        }
        return (
            <div className={classes.join(' ')} style={style}/>
        );
    }
}