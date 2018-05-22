import * as React from 'react';
import {connect} from 'react-redux';
import { IPlayer } from '../model/IPlayer';
import collectGun from '../state/actions/collectGun';
import fallMove from '../state/actions/fallMove';
import fallStart from '../state/actions/fallStart';
import gameStart from '../state/actions/gameStart';
import jumpMove from '../state/actions/jumpMove';
import jumpStart from '../state/actions/jumpStart';
import killEnemy from '../state/actions/killEnemy';
import playerHit from '../state/actions/playerHit';
import playerVulnerable from '../state/actions/playerVulnerable';
import stepMove from '../state/actions/stepMove';
import stepStart from '../state/actions/stepStart';
import stepStop from '../state/actions/stepStop';
import updateEnemy from '../state/actions/updateEnemy';
import { intersects } from '../utils/intersects';
import { Bullet } from './Bullet';
import * as Constants from './Constants';
import { Enemy } from './Enemy';
import './Game.css';
import { Gun } from './Gun';
import { IPosition } from './IPosition';
import {IShape} from './IShape';
import {Platform} from './Platform';
import {Player} from './Player';

interface ICollision {
    shape: IShape | null;
    newY: number;
    isEnemy: boolean;
}
class Game extends React.Component<any, any> {

    private stepInterval: any;
    private fallInterval: any;
    private gameElement: React.RefObject<HTMLDivElement>;

    constructor(props: React.Props<any>) {
        super(props);
        this.state = {
            bulletCount: 0,
            bullets: [],
            levelOffset: 0
        }
        this.gameElement = React.createRef();
    }

    public render() {
        const level = this.props.level;
        const platforms = level.platforms.map( (platform:IShape, i:number) => 
            <Platform key={i} x={platform.x} y={platform.y} height={platform.height} width={platform.width}/>
        );
        const enemies = level.enemies.map( (enemy:any, i:number) => 
            <Enemy key={i} {...enemy}/>
        );
        const guns = level.guns.map( (gun:IPosition, i:number) => 
            <Gun key={i} x={gun.x} y={gun.y}/>
        );
        const bullets = this.state.bullets.map( (bullet:any, i:number) => 
            <Bullet key={bullet.id} x={bullet.x} y={bullet.y}/>
        );
        const gameOver = this.props.player.hp <= 0;
        return (
        <div className="game" ref={this.gameElement}>
            <div className="scrollContainer" style={{
                left: this.state.levelOffset,
                width: this.props.level.width
            }}>
                {!gameOver? <Player {...this.props.player}/> : <></>}
                {platforms}
                {guns}
                {bullets}
                {enemies}
            </div>
            {gameOver?  <div className="gameOver">GAME OVER</div> : <></>}
        </div>
        );
    }

    public componentDidMount() {
        document.addEventListener('keydown', this.onKeyDown);
        document.addEventListener('keyup', this.onKeyUp);
        this.props.dispatch(gameStart());
        this.props.level.enemies.forEach((enemy:any) => {
            enemy.movementInterval = setInterval(() => {
                this.moveEnemy(enemy);
            }, 50);
        });
    }
    
    public componentWillUnmount() {
        document.removeEventListener('keydown', this.onKeyDown);
        document.removeEventListener('keyup', this.onKeyUp);
        this.props.level.enemies.forEach( (enemy:any) => {
            clearInterval(enemy.movementInterval);
        });
    }

    private checkPowerUps() {
        if (!this.props.player.hasGun && this.props.level.guns) {
            const powerUp = this.props.level.guns.find( (gun: IPosition) => 
                intersects(this.props.player, {
                    ...gun,
                    height: Constants.GUN_HEIGHT,
                    width: Constants.GUN_WIDTH
                })
            )
            if (powerUp) {
                this.props.dispatch(collectGun(powerUp))
            }
        }
    }

    private fall() {
        let player: IPlayer = this.props.player;
        if (!player.falling) {
            this.props.dispatch(fallStart());
            const fallIncrement = 5;
            this.fallInterval = setInterval(() => {
                player = this.props.player;
                let newY = player.y - fallIncrement;
                const to = this.willCollide(player);
                if(isNaN(to.newY) || to.newY < 0 ){
                    to.newY = 0;
                }
                let falling = true;
                if (newY <= to.newY) {
                    newY = to.newY;
                    falling = false;
                    clearInterval(this.fallInterval);
                }
                if(to.isEnemy) {
                    this.playerHit();
                }
                this.props.dispatch(fallMove(newY, falling));
                this.checkPowerUps();
            }, Constants.ANIMATION_FREQUENCY);
        }
    }

    private finishStep() {
        if (!isNaN(this.stepInterval)) {
            clearInterval(this.stepInterval);
            this.stepInterval = NaN;
            this.props.dispatch(stepStop())
        }
    }

    private fireGun() {
        const player: IPlayer = this.props.player;
        if (player.hasGun && this.state.bullets.length <= 7) {
            const bullet = {
                id: this.state.bulletCount + 1,
                x: player.x + 5,
                y: player.y + 17
            };
            let bulletIncrement = 10;
            if (player.inverted) {
                bulletIncrement = -bulletIncrement;
            }
            this.setState({
                bulletCount: this.state.bulletCount + 1,
                bullets: this.state.bullets.concat(bullet)
            });
            const bulletInterval = setInterval(() => {
                let newBullets = this.state.bullets;
                const newX = bullet.x + bulletIncrement;
                const collided = this.bulletIntersects({
                    height: 5,
                    width: 15,
                    x: newX,
                    y: bullet.y
                });
                if (collided || newX < 0 || newX > player.x + 1000) {
                    clearInterval(bulletInterval);
                    newBullets = newBullets.filter((b:any) => b.id !== bullet.id);
                } else {
                    bullet.x = newX;
                }
                this.setState({
                    bullets: newBullets
                });
            }, Constants.ANIMATION_FREQUENCY)
        }
    }

    private jump() {
        let player:IPlayer = this.props.player;
        if (!player.jumping && !player.falling) {
            let landY = player.y;
            this.props.dispatch(jumpStart());
            const increment = (Constants.JUMP_HEIGHT / Constants.ANIMATION_FREQUENCY);
            const jumpInterval = setInterval(() => {
                player = this.props.player;
                const now = Date.now();
                const percent = (now - player.jumpStart)/Constants.JUMP_TIME;
                let newY = landY;
                let jumping = true;
                if (percent <= 0.5) { // On way up.
                    newY = player.y + increment;
                } else { // On way down.
                    newY = player.y - increment;
                    if (newY < landY) { // Jump over
                        newY = landY;
                        jumping = false;
                        clearInterval(jumpInterval);
                    } else { // Check for collision
                        const platform = this.willCollide(player);
                        if (!isNaN(platform.newY) && platform.newY >= 0) {
                            landY = platform.newY;
                            // Prevent falling through floor.
                            if (newY < landY) {
                                newY = landY;
                            }
                        }
                    }
                }
                this.props.dispatch(jumpMove(newY, jumping));
                this.checkPowerUps();
            }, Constants.ANIMATION_FREQUENCY);
        }
   }

   private moveEnemy = (enemy: any) => {
        enemy.x += (enemy.inverted ? -enemy.speed : enemy.speed);
        if (enemy.x <= enemy.minX) {
            enemy.inverted = false;
        } else if(enemy.x >= enemy.maxX) {
            enemy.inverted = true;
        }
        if(intersects(enemy, this.props.player)) {
            this.playerHit();
        }
        this.props.dispatch(updateEnemy(enemy));
    }

   private moveLeft() {
       const player:IPlayer = this.props.player;
       this.step({
            height: Constants.PLAYER_HEIGHT,
            width: Constants.PLAYER_WIDTH,            
            x: player.x <= Constants.STEP_WIDTH ? 0 : player.x - Constants.STEP_WIDTH,
            y: player.y
       }, true);
   }

    private moveRight() {
        const player:IPlayer = this.props.player;
        this.step({
            height: Constants.PLAYER_HEIGHT,
            width: Constants.PLAYER_WIDTH,
            x: player.x + Constants.STEP_WIDTH,
            y: player.y,
       }, false);
    }

    private onKeyDown = (event: KeyboardEvent) => {
        switch (event.key) {
            case "ArrowLeft" :
                this.moveLeft();
                event.preventDefault();
                break;
            case "ArrowRight" :
                this.moveRight();
                event.preventDefault();
                break;
            case "ArrowUp" :
                this.jump();
                event.preventDefault();
                break;
            case " " : 
                this.fireGun();
                event.preventDefault();
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
                event.preventDefault();
                break;
            default :
                break;
        }
        return;
    }

    private step(coords: IShape, inverted:boolean) {
        if (isNaN(this.stepInterval)) {
            let player: IPlayer = this.props.player;
            this.props.dispatch(stepStart(inverted));
            const increment = coords.x - player.x;
            let newX = coords.x - increment;
            this.stepInterval = setInterval(() => {
                player = this.props.player;
                newX += increment;
                let stepping = true;
                const collision:ICollision = this.willCollide({
                    ...coords,
                    x: newX,
                    y: player.y
                });
                let levelOffset = this.state.levelOffset;
                if(collision.isEnemy && !player.invulnerable) {
                    newX = player.x;
                    this.playerHit();
                } else if(collision.newY === -1) {
                    newX = player.x;
                    stepping = false;
                } else if (this.gameElement.current){
                    const viewWidth = this.gameElement.current.offsetWidth;
                    const bufferSize = 200;
                    if (newX + levelOffset <= bufferSize && levelOffset < 0) {
                        /* Scroll left */
                        levelOffset -= increment;
                    } else if (newX >= viewWidth - bufferSize && increment > 0 && levelOffset + this.props.level.width > viewWidth) {
                        /* Scroll right */
                        levelOffset -= increment;
                    }
                }
                this.props.dispatch(stepMove(newX, stepping));
                this.setState({
                    levelOffset
                });
                this.checkPowerUps();
                if (!isNaN(collision.newY) && collision.newY !== player.y && !player.jumping && stepping) {
                    this.fall();
                }
            }, Constants.STEP_SPEED);
        }
    }

    private playerHit() {
        if (this.props.player.invulnerable) {
            return;
        }
        this.props.dispatch(playerHit());
        if(this.props.player.hp > 0) {
            setTimeout(() => {
                this.props.dispatch(playerVulnerable());
            }, 3000);
        }
    }

    private bulletIntersects(shape: IShape): IShape | undefined {
        let collided = this.props.level.platforms.find((platform:IShape) => {
            return intersects(shape, platform);
        });
        if (collided) {
            return collided;
        }
        collided = this.props.level.enemies.find((platform:IShape) => {
            return intersects(shape, platform);
        });
        if (collided) {
            collided.hp--;
            if (collided.hp > 0) {
                this.hitEnemy(collided);
            } else {
                clearInterval(collided.movementInterval);
                this.props.dispatch(killEnemy(collided));
            }
            return collided;
        }
        return;
    }

    private hitEnemy(enemy:any){
        enemy.hit = true;
        this.props.dispatch(updateEnemy(enemy));
        enemy.hitTimer = setTimeout(() => {
            enemy.hit = false;
            delete enemy.hitTimer;
            this.props.dispatch(updateEnemy(enemy));
        }, 299);
    }

    private willCollide(shape: IShape): ICollision {
        const collision: ICollision = {
            isEnemy: false,
            newY: NaN,
            shape: null,
        }

        if(shape.x < 0 || shape.x + shape.width >= this.props.level.width) {
            collision.newY = -1;
            return collision;
        }
        let collided = this.props.level.platforms.find((platform:IShape) => {
            return (shape.x + shape.width > platform.x && shape.x < platform.x + platform.width);
        });
        if (collided) {
            collision.shape = collided;
            // Jumped/fell onto platform
            if (shape.y >= collided.y && (this.props.player.jumping || this.props.player.falling)) {
                collision.newY = collided.y + collided.height;
            } else if (intersects(shape, collided)) {
                // Walked into platform.
                collision.newY = -1;
            }
            return collision;
              
        }
        collided = this.props.level.enemies.find( (enemy:IShape) => {
            return intersects(shape, enemy);
        });
        if (collided) {
            collision.shape = collided;
            collision.isEnemy = true;
        }
        // Check for falling off platform  
        if (shape.y > 0) {
            collision.newY = 0;
        }
        return collision;
    }
}

export default connect((state: any) => {
    const gameProps: any = {};
    gameProps.player = state.player;
    gameProps.level = state.level;
    return gameProps;
  })(Game);