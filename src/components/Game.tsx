import * as React from 'react';
import {connect} from 'react-redux';
import * as Constants from './Constants';
import './Game.css';
import {IShape} from './IShape';
import {Platform} from './Platform';
import {Player} from './Player';

class Game extends React.Component<any, any> {

    private stepInterval: any;

    constructor(props: React.Props<any>) {
        super(props);
        this.state = {
            inverted: false,
            jumpStart: NaN,
            jumping: false,
            platformY: NaN,
            platforms: [{
                height: 20,
                width: 60,
                x: 210,
                y: 20
            }, {
                height: 20,
                width: 90,
                x: 360,
                y: 40
            }],
            stepStart: NaN,
            stepping: false,
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
                jumping={this.state.jumping}
                jumpStart={this.state.jumpStart}
                stepping={this.state.stepping}
                stepStart={this.state.stepStart}
                falling={this.state.falling}/>
            {platforms}
        </div>
        );
    }

    public componentDidMount() {
        document.addEventListener('keydown', this.onKeyDown);
        document.addEventListener('keyup', this.onKeyUp);
    }
    
    public componentWillUnmount() {
        document.removeEventListener('keydown', this.onKeyDown);
        document.addEventListener('keyup', this.onKeyUp);
    }

    private fall(to:number) {
        if (!this.state.falling) {
            this.setState({
                falling: true
            });
            const fallInterval = setInterval(() => {
                let newY = this.state.y - 5;
                let falling = true;
                if (newY <= to) {
                    newY = to;
                    falling = false;
                    clearInterval(fallInterval);
                }
                this.setState({
                    falling,
                    y: newY
                });
            }, Constants.ANIMATION_FREQUENCY);
        }
    }

    private finishStep() {
        console.log('finishStep');
        if (this.state.stepping) {
            clearInterval(this.stepInterval);
            this.setState({
                stepping: false
            });
        }
    }

    private jump() {
        if (!this.state.jumping) {
            const baseY = this.state.y;
            const time = Date.now();
            this.setState({
                jumpStart: time,
                jumping: true
            });
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
                if (!isNaN(this.state.platformY) && newY <= this.state.platformY) { // Jumped onto platform.
                    newY = this.state.platformY;
                    jumping = false;
                    clearInterval(jumpInterval);
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

    private onKeyDown = (event: KeyboardEvent) => {
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

    private onKeyUp = (event: KeyboardEvent) => {
        switch (event.key) {
            case "ArrowLeft" :
            case "ArrowRight" :
                this.finishStep();
                break;
            default :
                break;
        }
        return;
    }

    private step(player: IShape) {
        if (!this.state.stepping) {
            const time = Date.now();
            this.setState({
                stepStart: time,
                stepping: true
            });
            let newX = player.x;
            const increment = player.x - this.state.x;
            this.stepInterval = setInterval(() => {
                newX += increment;
                const newY = this.willCollide({
                    ...player,
                    x: newX
                });
                if(isNaN(newY) || newY >= 0) {
                    this.setState({
                        x: newX
                    });
                } else {
                    this.finishStep();
                }
                
                // TODO: Need to distinguish between falling to floor and falling onto another platform.
                if (!isNaN(newY) && newY === 0) {
                    this.fall(newY);
                } else if (newY > 0) { // Jumping onto platform.
                    this.setState({
                        platformY: newY
                    });
                }
            }, Constants.STEP_SPEED);
        }
    }

    private willCollide(shape: IShape): number {
        if(shape.x < 0) {
            return -1;
        }
        const collided = this.state.platforms.find((platform:IShape) => {
            return (shape.x + shape.width > platform.x && shape.x < platform.x + platform.width);
        });
        if (collided) {
            // Jumped onto platform
            if (shape.y >= collided.y + collided.height) {
                return collided.y + collided.height;
            } else {
                // Walked into platform.
                return -1;
            }
        // Falling off platform    
        } else if (!isNaN(this.state.platformY)) {
            this.setState({
                platformY: NaN
            });
            return 0;
        } else {
            // No collision.
            return NaN;
        }
    }
}

export default connect((state: any, gameProps:any = {}) => {
    // gameProps.score = state.score;
    // gameProps.playerPosition = state.playerPosition;
    return gameProps;
  })(Game);