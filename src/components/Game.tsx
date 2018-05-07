import * as React from 'react';
import {connect} from 'react-redux';
import './Game.css';
import {Player} from './Player';

class Game extends React.Component {
    public render() {
        return (
        <div className="game" onKeyDown={this.onKeyPress} onMouseDown={this.onMouseDown}>
            <Player x={0} y={0}/>
        </div>
        );
    }

    private onKeyPress = (event: React.SyntheticEvent<any>) => {
        // tslint:disable-next-line
        console.log(event);
        return;
    }

    private onMouseDown = (event: React.SyntheticEvent<any>) => {
        // tslint:disable-next-line
        console.log(event);
        return;
    }
}

export default connect((state: any, gameProps:any = {}) => {
    // gameProps.score = state.score;
    // gameProps.playerPosition = state.playerPosition;
    return gameProps;
  })(Game);