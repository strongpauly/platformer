import * as React from 'react';
import {connect} from 'react-redux';
import level from '../levels/1';
import gameStart from '../state/actions/gameStart';
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

interface IPlayer extends IShape {
    falling: boolean;
    hasGun: boolean;
    hp: number;
    inverted: boolean;
    invulnerable: boolean;
    jumpStart: number;
    jumping: boolean;
    stepStart: number;
    stepping: boolean;
}

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
            enemies: level.enemies.map( (enemy: any, index:number) => {
                enemy.id = index;
                enemy.width = Constants.ENEMY_WIDTH;
                enemy.height = Constants.ENEMY_HEIGHT;
                return enemy;
            }),
            gameOver: false,
            guns: level.guns,
            levelOffset: 0,
            levelWidth: 10000,
            platforms: level.platforms,
            player: {
                hasGun: false,
                height: Constants.PLAYER_HEIGHT,
                hp: 10,
                inverted: false,
                invulnerable: false,
                jumpStart: NaN,
                jumping: false,
                stepStart: NaN,
                stepping: false,
                width: Constants.PLAYER_WIDTH,
                x: 0,
                y: 0
            },
        }
        this.gameElement = React.createRef();
    }

    public render() {
        const platforms = this.state.platforms.map( (platform:IShape, i:number) => 
            <Platform key={i} x={platform.x} y={platform.y} height={platform.height} width={platform.width}/>
        );
        const enemies = this.state.enemies.map( (enemy:any, i:number) => 
            <Enemy key={i} x={enemy.x} y={enemy.y} minX={enemy.minX} maxX={enemy.maxX} speed={enemy.speed} inverted={enemy.inverted} hit={enemy.hit}/>
        );
        const guns = this.state.guns.map( (gun:IPosition, i:number) => 
            <Gun key={i} x={gun.x} y={gun.y}/>
        );
        const bullets = this.state.bullets.map( (bullet:any, i:number) => 
            <Bullet key={bullet.id} x={bullet.x} y={bullet.y}/>
        );
        return (
        <div className="game" ref={this.gameElement}>
            <div className="scrollContainer" style={{
                left: this.state.levelOffset,
                width: this.state.levelWidth
            }}>
            <Player 
                x={this.state.player.x} 
                y={this.state.player.y} 
                hp={this.state.player.hp}
                inverted={this.state.player.inverted}
                invulnerable={this.state.player.invulnerable}
                jumping={this.state.player.jumping}
                jumpStart={this.state.player.jumpStart}
                stepping={this.state.player.stepping}
                stepStart={this.state.player.stepStart}
                falling={this.state.player.falling}
                hasGun={this.state.player.hasGun}/>
            {platforms}
            {guns}
            {bullets}
            {enemies}
            </div>
            <div>
                <span>HP: </span><span>{this.state.player.hp}</span>
            </div>
        </div>
        );
    }

    public componentDidMount() {
        document.addEventListener('keydown', this.onKeyDown);
        document.addEventListener('keyup', this.onKeyUp);
        this.props.dispatch(gameStart());
        this.state.enemies.forEach((enemy:any) => {
            enemy.movementInterval = setInterval(() => {
                this.moveEnemy(enemy);
            }, 50);
        });
    }
    
    public componentWillUnmount() {
        document.removeEventListener('keydown', this.onKeyDown);
        document.addEventListener('keyup', this.onKeyUp);
        this.state.enemies.forEach( (enemy:any) => {
            clearInterval(enemy.movementInterval);
        });
    }

    private checkPowerUps() {
        if (!this.state.player.hasGun && this.state.guns) {
            const powerUp = this.state.guns.find( (gun: IPosition) => 
                intersects(this.state.player, {
                    ...gun,
                    height: Constants.GUN_HEIGHT,
                    width: Constants.GUN_WIDTH
                })
            )
            if (powerUp) {
                this.setState({
                    guns: this.state.guns.filter( (gun: IPosition) => gun.x !== powerUp.x && gun.y !== powerUp.y),
                    player: {
                        ...this.state.player,
                        hasGun: true
                    }
                });
            }
        }
    }

    private fall() {
        let player: IPlayer = this.state.player;
        if (!player.falling) {
            player.falling = true;
            this.setState({
                player
            });
            const fallIncrement = 5
            this.fallInterval = setInterval(() => {
                player = this.state.player;
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
                    player = this.playerHit();
                }
                player.falling = falling;
                player.y = newY;
                this.setState({
                    player
                });
                this.checkPowerUps();
            }, Constants.ANIMATION_FREQUENCY);
        }
    }

    private finishStep() {
        if (!isNaN(this.stepInterval)) {
            clearInterval(this.stepInterval);
            this.stepInterval = NaN;
            this.setState({
                player: {
                    ...this.state.player,
                    stepping: false
                }
            });
        }
    }

    private fireGun() {
        const player: IPlayer = this.state.player;
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
        let player:IPlayer = this.state.player;
        if (!player.jumping && !player.falling) {
            let landY = player.y;
            const time = Date.now();
            player.jumping = true;
            player.jumpStart = time;
            this.setState({
                player
            });
            const increment = (Constants.JUMP_HEIGHT / Constants.ANIMATION_FREQUENCY);
            const jumpInterval = setInterval(() => {
                player = this.state.player;
                const now = Date.now();
                const percent = (now - time)/Constants.JUMP_TIME;
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
                player.jumping = jumping;
                player.y = newY;
                this.setState({
                    player
                });
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
        if(intersects(enemy, this.state.player)) {
            const player = this.playerHit();
            this.setState({
                player
            });
        }
        this.updateEnemy(enemy);
    }

    private updateEnemy(enemy: any): Promise<void> {
        return new Promise((resolve, reject) => {
            this.setState({
                enemies: this.state.enemies.map( (e:any) => {
                    if(e.id === enemy.id) {
                        return enemy;
                    }
                    return e;
                })
            }, resolve);
        });
    }

   private moveLeft() {
       const player:IPlayer = this.state.player;
       player.inverted = true;
       this.setState({
            player
       });
       this.step({
            height: Constants.PLAYER_HEIGHT,
            width: Constants.PLAYER_WIDTH,            
            x: player.x <= Constants.STEP_WIDTH ? 0 : player.x - Constants.STEP_WIDTH,
            y: player.y
       });
   }

    private moveRight() {
        const player:IPlayer = this.state.player;
        player.inverted = false;
        this.setState({
            player
        });
        this.step({
            height: Constants.PLAYER_HEIGHT,
            width: Constants.PLAYER_WIDTH,
            x: player.x + Constants.STEP_WIDTH,
            y: player.y,
       });
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

    private step(coords: IShape) {
        if (isNaN(this.stepInterval)) {
            let player: IPlayer = this.state.player;
            const time = Date.now();
            player.stepStart = time;
            player.stepping = true;
            this.setState({
                player
            });
            let newX = coords.x;
            const increment = coords.x - player.x;
            this.stepInterval = setInterval(() => {
                player = this.state.player;
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
                    player = this.playerHit();
                } else if(collision.newY === -1) {
                    newX = player.x;
                    stepping = false;
                } else if (this.gameElement.current){
                    const viewWidth = this.gameElement.current.offsetWidth;
                    if (newX + levelOffset <= 200 && levelOffset < 0) {
                        levelOffset -= increment;
                    } else if (newX >= viewWidth - 200 && increment > 0) {
                        levelOffset -= increment;
                    }
                }
                this.setState({
                    levelOffset,
                    player: {
                        ...player,
                        stepping,
                        x: newX
                    }
                });
                this.checkPowerUps();
                if (!isNaN(collision.newY) && collision.newY !== player.y && !player.jumping && stepping) {
                    this.fall();
                }
            }, Constants.STEP_SPEED);
        }
    }

    private playerHit(): IPlayer {
        let player = this.state.player;
        if (player.invulnerable) {
            return player;
        }
        player.hp --;
        player.invulnerable = true;
        setTimeout(() => {
            player = this.state.player;
            player.invulnerable = false;
            this.setState({
                player
            })
        }, 3000);
        return player
    }

    private bulletIntersects(shape: IShape): IShape | undefined {
        let collided = this.state.platforms.find((platform:IShape) => {
            return intersects(shape, platform);
        });
        if (collided) {
            return collided;
        }
        collided = this.state.enemies.find((platform:IShape) => {
            return intersects(shape, platform);
        });
        if (collided) {
            collided.hp--;
            if (collided.hp > 0) {
                if (collided.hit) {
                    // Hit a second time.
                    collided.hit = false;
                    this.updateEnemy(collided).then( () => {
                        this.hitEnemy(collided);
                    });
                } else {
                    this.hitEnemy(collided)
                }
            } else {
                clearInterval(collided.movementInterval);
                this.setState({
                    enemies: this.state.enemies.filter( (e:any) => e.id !== collided.id)
                });
            }
            return collided;
        }
        return;
    }

    private hitEnemy(enemy:any){
        enemy.hit = true;
        this.updateEnemy(enemy);
        enemy.hitTimer = setTimeout( () => {
            enemy.hit = false;
            delete enemy.hitTimer;
            this.updateEnemy(enemy);
        }, 299);
    }

    /**
     * Returns a new Y coordinate based on whether the player will collide with a platform.
     * Takes into account whether player is currently jumping or falling.
     * @param shape Player
     * @returns NaN if no collision will occur, -1 if new position collides with a platform, or
     * the new Y coordinate of the platform that player fell into.
     */
    private willCollide(shape: IShape): ICollision {
        const collision: ICollision = {
            isEnemy: false,
            newY: NaN,
            shape: null,
        }

        if(shape.x < 0) {
            return collision;
        }
        let collided = this.state.platforms.find((platform:IShape) => {
            return (shape.x + shape.width > platform.x && shape.x < platform.x + platform.width);
        });
        if (collided) {
            collision.shape = collided;
            // Jumped/fell onto platform
            if (shape.y >= collided.y && (this.state.player.jumping || this.state.player.falling)) {
                collision.newY = collided.y + collided.height;
            } else if (intersects(shape, collided)) {
                // Walked into platform.
                collision.newY = -1;
            }
            return collision;
              
        }
        collided = this.state.enemies.find( (enemy:IShape) => {
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

export default connect((state: any, gameProps:any = {}) => {
    // gameProps.score = state.score;
    // gameProps.playerPosition = state.playerPosition;
    return gameProps;
  })(Game);