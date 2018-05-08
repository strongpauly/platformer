import * as React from 'react';
import {connect} from 'react-redux';
import './Game.css';
import { IShape } from './IShape';
import {Platform} from './Platform';
import {Player} from './Player';

class Game extends React.Component<any, any> {
    private static JUMP_HEIGHT = 150;
    private static JUMP_TIME = 300;
    private static STEP_WIDTH = 20;
    private static STEP_TIME = 100;
    private static PLAYER_WIDTH = 20;
    private static PLAYER_HEIGHT = 60;
    private static ANIMATION_FREQUENCY = 10;

    constructor(props: React.Props<any>) {
        super(props);
        this.state = {
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
            <Player x={this.state.x} y={this.state.y} width={Game.PLAYER_WIDTH} height={Game.PLAYER_HEIGHT}/>
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
                const percent = (now - time)/Game.JUMP_TIME;
                let newY = baseY;
                let jumping = true;
                if (percent >= 1) { // Jump over
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
            }, Game.ANIMATION_FREQUENCY);
        }
   }

   private moveLeft() {
       this.step({
            height: Game.PLAYER_HEIGHT,
            width: Game.PLAYER_WIDTH,
            x: this.state.x <= Game.STEP_WIDTH ? 0 : this.state.x - Game.STEP_WIDTH,
            y: this.state.y,
       });
   }

    private moveRight() {
        this.step({
            height: Game.PLAYER_HEIGHT,
            width: Game.PLAYER_WIDTH,
            x: this.state.x + Game.STEP_WIDTH,
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
                const percent = (now - time)/Game.STEP_TIME;
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
            }, Game.ANIMATION_FREQUENCY)
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