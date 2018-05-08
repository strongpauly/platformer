import * as React from 'react';
import {connect} from 'react-redux';
import './Game.css';
import {Player} from './Player';

class Game extends React.Component<any, any> {
    private static JUMP_HEIGHT = 100;
    private static JUMP_TIME = 300;
    private static STEP_WIDTH = 20;

    constructor(props: React.Props<any>) {
        super(props);
        this.state = {
            jumping: false,
            x: 0,
            y: 0
        }
    }

    public render() {
        return (
        <div className="game">
            <Player x={this.state.x} y={this.state.y}/>
        </div>
        );
    }

    public componentDidMount() {
        document.addEventListener('keyup', this.onKeyPress);
    }
    
    public componentWillUnmount() {
        document.removeEventListener('keyup', this.onKeyPress);
    }

    public jump() {
        if (!this.state.jumping) {
            const baseY = this.state.y;
            this.setState({
                jumping: true
            });
            const time = Date.now();
            const jumpInterval = setInterval(() => {
                const now = Date.now();
                const percent = (now - time)/Game.JUMP_TIME;
                let newY = baseY;
                let jumping = true;
                if (percent > 1) { // Jump over
                    jumping = false;
                    clearInterval(jumpInterval);
                } else if (percent <= 0.5) { // On way up.
                    newY += (Game.JUMP_HEIGHT * percent * 2)
                } else { // On way down.
                    newY += Game.JUMP_HEIGHT * (1 - percent) * 2
                }
                this.setState({
                    jumping,
                    y: newY
                });
            }, 1);
        }
   }

    private onKeyPress = (event: KeyboardEvent) => {
        switch (event.key) {
            case "ArrowLeft" :
                this.setState({
                    x: this.state.x <= Game.STEP_WIDTH ? 0 : this.state.x - Game.STEP_WIDTH
                });
                break;
            case "ArrowRight" :
                this.setState({
                    x: this.state.x + Game.STEP_WIDTH
                })
                break;
            case "ArrowUp" :
               this.jump();
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