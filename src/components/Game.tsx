import * as React from 'react';
import {connect} from 'react-redux';
import './Game.css';
import {Player} from './Player';

class Game extends React.Component<any, any> {
    public render() {
        return (
        <div className="game">
            <Player x={0} y={0}/>
        </div>
        );
    }

    public componentDidMount() {
        document.addEventListener('keyup', this.onKeyPress);
    }
    
    public componentWillUnmount() {
        document.removeEventListener('keyup', this.onKeyPress);
    }

    private onKeyPress(event: KeyboardEvent){
        // tslint:disable-next-line
        console.log(event);
        switch (event.key) {
            case "ArrowLeft" :
              // tslint:disable-next-line
                console.log('left');
            break;
            case "ArrowRight" :
              // tslint:disable-next-line
                console.log('right');
            break;
            case "ArrowUp" :
              // tslint:disable-next-line
                console.log('jump');
            break;
            default :
                break;
        }
        return;
    }
}

export default connect((state: any, gameProps:any = {}) => {
    // gameProps.score = state.score;
    // gameProps.playerPosition = state.playerPosition;
    return gameProps;
  })(Game);