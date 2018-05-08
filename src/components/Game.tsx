import * as React from 'react';
import {connect} from 'react-redux';
import * as Constants from './Constants';
import './Game.css';
import {IShape} from './IShape';
import {Platform} from './Platform';
import {Player} from './Player';

class Game extends React.Component<any, any> {

    constructor(props: React.Props<any>) {
        super(props);
        this.state = {
            inverted: false,
            jumping: false,
            platforms: [{
                height: 20,
                width: 60,
                x: 200,
                y: 20
            }],
            x: 0,
            y: 0
        }
    }

    public render() {
        const platforms = this.state.platforms.map( (platform:IShape, i:number) => 
            <Platform key={i} x={platform.x} y={platform.y} height={platform.height} width={platform.width}/>
        );
        return (
        <div className="game">
            <Player 
                x={this.state.x} 
                y={this.state.y} 
                inverted={this.state.inverted}
                jumping={this.state.jumping}/>
            {platforms}
        </div>
        );
    }

    public componentDidMount() {
        document.addEventListener('keydown', this.onKeyPress);
    }
    
    public componentWillUnmount() {
        document.removeEventListener('keydown', this.onKeyPress);
    }

    private jump() {
        if (!this.state.jumping) {
            const baseY = this.state.y;
            this.setState({
                jumping: true
            });
            const time = Date.now();
            const jumpInterval = setInterval(() => {
                const now = Date.now();
                const percent = (now - time)/Constants.JUMP_TIME;
                let newY = baseY;
                let jumping = true;
                if (percent >= 1) { // Jump over
                    jumping = false;
                    clearInterval(jumpInterval);
                } else if (percent <= 0.5) { // On way up.
                    newY += (Constants.JUMP_HEIGHT * percent * 2)
                } else { // On way down.
                    newY += Constants.JUMP_HEIGHT * (1 - percent) * 2
                }
                this.setState({
                    jumping,
                    y: newY
                });
            }, Constants.ANIMATION_FREQUENCY);
        }
   }

   private moveLeft() {
       this.setState({
           inverted: true
       });
       this.step({
            height: Constants.PLAYER_HEIGHT,
            width: Constants.PLAYER_WIDTH,            
            x: this.state.x <= Constants.STEP_WIDTH ? 0 : this.state.x - Constants.STEP_WIDTH,
            y: this.state.y
       });
   }

    private moveRight() {
        this.setState({
            inverted: false
        });
        this.step({
            height: Constants.PLAYER_HEIGHT,
            width: Constants.PLAYER_WIDTH,
            x: this.state.x + Constants.STEP_WIDTH,
            y: this.state.y,
       });
    }

    private onKeyPress = (event: KeyboardEvent) => {
        switch (event.key) {
            case "ArrowLeft" :
                this.moveLeft();
                break;
            case "ArrowRight" :
                this.moveRight();
                break;
            case "ArrowUp" :
               this.jump();
                break;
            default :
                break;
        }
        return;
    }

    private step(player: IShape) {
        if(!this.willCollide(player) && !this.state.stepping) {
            const time = Date.now();
            const startX = this.state.x;
            this.setState({
                stepping: true
            });
            const stepInterval = setInterval(() => {
                const now = Date.now();
                const percent = (now - time)/Constants.STEP_TIME;
                let newX = startX + ((player.x - startX)* percent);
                let stepping = true;
                if (percent >= 1) { // step over
                    newX = player.x;
                    stepping = false;
                    clearInterval(stepInterval);
                } 
                this.setState({
                    stepping,
                    x: newX
                });
            }, Constants.ANIMATION_FREQUENCY);
        }
    }

    private willCollide(shape: IShape): boolean {
        return this.state.platforms.some((platform:IShape) => {
            return (shape.x >= platform.x && shape.x <= platform.x + platform.width) ||
                (shape.y >= platform.y && shape.y <= platform.y + platform.height);
        });
    }
}

export default connect((state: any, gameProps:any = {}) => {
    // gameProps.score = state.score;
    // gameProps.playerPosition = state.playerPosition;
    return gameProps;
  })(Game);