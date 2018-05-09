import * as React from 'react';
import {connect} from 'react-redux';
import * as Constants from './Constants';
import './Game.css';

import { intersects } from '../utils/intersects';
import {IShape} from './IShape';
import {Platform} from './Platform';
import {Player} from './Player';

class Game extends React.Component<any, any> {

    private stepInterval: any;
    private fallInterval: any;

    constructor(props: React.Props<any>) {
        super(props);
        this.state = {
            hasGun: Math.random() > 0.5,
            inverted: false,
            jumpStart: NaN,
            jumping: false,
            platforms: [{
                height: 20,
                width: 120,
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
                falling={this.state.falling}
                hasGun={this.state.hasGun}/>
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

    private fall() {
        if (!this.state.falling) {
            this.setState({
                falling: true
            });
            const fallIncrement = 5
            this.fallInterval = setInterval(() => {
                let newY = this.state.y - fallIncrement;
                let to = this.willCollide({
                    height: Constants.PLAYER_HEIGHT,
                    width: Constants.PLAYER_WIDTH,            
                    x: this.state.x,
                    y: newY
                });
                if(isNaN(to) || to < 0 ){
                    to = 0;
                }
                let falling = true;
                if (newY <= to) {
                    newY = to;
                    falling = false;
                    clearInterval(this.fallInterval);
                }
                this.setState({
                    falling,
                    y: newY
                });
            }, Constants.ANIMATION_FREQUENCY);
        }
    }

    private finishStep() {
        if (!isNaN(this.stepInterval)) {
            clearInterval(this.stepInterval);
            this.stepInterval = NaN;
            this.setState({
                stepping: false
            });
        }
    }

    private jump() {
        if (!this.state.jumping) {
            let landY = this.state.y;
            const time = Date.now();
            this.setState({
                jumpStart: time,
                jumping: true
            });
            const increment = (Constants.JUMP_HEIGHT / Constants.ANIMATION_FREQUENCY);
            const jumpInterval = setInterval(() => {
                const now = Date.now();
                const percent = (now - time)/Constants.JUMP_TIME;
                let newY = landY;
                let jumping = true;
                if (percent <= 0.5) { // On way up.
                    newY = this.state.y + increment;
                } else { // On way down.
                    newY = this.state.y - increment;
                    if (newY < landY) { // Jump over
                        newY = landY;
                        jumping = false;
                        clearInterval(jumpInterval);
                    } else { // Check for collision
                        const platformY = this.willCollide({
                            height: Constants.PLAYER_HEIGHT,
                            width: Constants.PLAYER_WIDTH,            
                            x: this.state.x,
                            y: newY
                        });
                        if (!isNaN(platformY) && platformY >= 0) {
                            landY = platformY;
                            // Prevent falling through floor.
                            if (newY < landY) {
                                newY = landY;
                            }
                        }
                    }
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
        if (isNaN(this.stepInterval)) {
            const time = Date.now();
            this.setState({
                stepStart: time,
                stepping: true
            });
            let newX = player.x;
            const increment = player.x - this.state.x;
            this.stepInterval = setInterval(() => {
                newX += increment;
                let stepping = true;
                const newY = this.willCollide({
                    ...player,
                    x: newX
                });
                if(newY === -1) {
                   newX = this.state.x;
                   stepping = false;
                }
                this.setState({
                    stepping,
                    x: newX
                });
                if (!isNaN(newY) && newY !== this.state.y && !this.state.jumping && stepping) {
                    this.fall();
                }
            }, Constants.STEP_SPEED);
        }
    }

    /**
     * Returns a new Y coordinate based on whether the player will collide with a platform.
     * Takes into account whether player is currently jumping or falling.
     * @param shape Player
     * @returns NaN if no collision will occur, -1 if new position collides with a platform, or
     * the new Y coordinate of the platform that player fell into.
     */
    private willCollide(shape: IShape): number {
        if(shape.x < 0) {
            return -1;
        }
        const collided = this.state.platforms.find((platform:IShape) => {
            return (shape.x + shape.width > platform.x && shape.x < platform.x + platform.width);
        });
        if (collided) {
            // Jumped/fell onto platform
            if (shape.y >= collided.y && (this.state.jumping || this.state.falling)) {
                return collided.y + collided.height;
            } else if (intersects(shape, collided)) {
                // Walked into platform.
                return -1;
            }
        // Check for falling off platform    
        } else if (shape.y > 0) {
            return 0;
        }
        // No collision.
        return NaN;
    }
}

export default connect((state: any, gameProps:any = {}) => {
    // gameProps.score = state.score;
    // gameProps.playerPosition = state.playerPosition;
    return gameProps;
  })(Game);