import * as React from 'react';
import {connect} from 'react-redux';
import { IPlayer } from '../model/IPlayer';
import changeLevel from '../state/actions/changeLevel';
import collectGun from '../state/actions/collectGun';
import fallMove from '../state/actions/fallMove';
import fallStart from '../state/actions/fallStart';
import gameStart from '../state/actions/gameStart';
import jumpMove from '../state/actions/jumpMove';
import jumpStart from '../state/actions/jumpStart';
import killEnemy from '../state/actions/killEnemy';
import openDoor from '../state/actions/openDoor';
import playerHit from '../state/actions/playerHit';
import playerVulnerable from '../state/actions/playerVulnerable';
import stepMove from '../state/actions/stepMove';
import stepStart from '../state/actions/stepStart';
import stepStop from '../state/actions/stepStop';
import updateEnemy from '../state/actions/updateEnemy';
import { intersects } from '../utils/intersects';
import { Bullet } from './Bullet';
import * as Constants from './Constants';
import { Door } from './Door';
import { Enemy } from './Enemy';
import './Game.css';
import { Gun } from './Gun';
import { IPosition } from './IPosition';
import {IShape} from './IShape';
import {Platform} from './Platform';
import {Player} from './Player';

interface ICollision {
    shape: IShape | null;
    canMove: boolean;
    newY: number;
    isEnemy: boolean;
}
class Game extends React.Component<any, any> {

    private stepInterval: any;
    private fallInterval: any;
    private jumpInterval: any;
    private enemyInterval: any;
    private gameElement: React.RefObject<HTMLDivElement>;
    private currentLevel: string;

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
        const doors = level.doors.map( (door:any, i:number) => 
            <Door key={door.id} x={door.x} y={door.y} open={door.open}/>
        );
        const gameOver = this.props.player.hp <= 0;
        return (
        <div className="game" ref={this.gameElement}>
            <div className="scrollContainer" style={{
                left: this.state.levelOffset,
                width: this.props.level.width
            }}>
                {doors}
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
    }
    
    public componentWillUnmount() {
        document.removeEventListener('keydown', this.onKeyDown);
        document.removeEventListener('keyup', this.onKeyUp);
        clearInterval(this.fallInterval);
        clearInterval(this.stepInterval);
        clearInterval(this.jumpInterval);
        this.state.bullets.forEach( (bullet:any) => {
            clearInterval(bullet.bulletInterval);
        })
        this.stopEnemies(this.props.level);
    }

    public componentDidUpdate(prevProps:Readonly<any>, prevState:Readonly<any>) {
        if(!this.currentLevel || this.currentLevel !== this.props.level.name) {
            if (this.currentLevel) {
                this.stopEnemies(prevProps.level);
            }
            this.startEnemies(this.props.level);
            this.currentLevel = this.props.level.name;
            this.setState({
                bulletCount: 0,
                bullets: [],
                levelOffset: 0
            });
        }
    }

    private startEnemies(level:any) {
        this.enemyInterval = setInterval(() => {
            this.moveEnemies();
        }, Constants.ENEMY_UPDATE_FREQUENCY);
        
    }

    private stopEnemies(level:any) {
        clearInterval(this.enemyInterval);
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

    private checkDoors() {
        const door = this.props.level.doors.find( (d: IPosition) => 
            intersects(this.props.player, {
                ...d,
                height: Constants.DOOR_HEIGHT,
                width: Constants.DOOR_WIDTH
            })
        )
        if (door) {
            this.props.dispatch(openDoor(door));
            if (door.to && this.props.player.x + this.props.player.width > door.x + (Constants.DOOR_WIDTH / 2)) {
                this.finishStep();
                this.props.dispatch(changeLevel(door.to));
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
            const bullet:any = {
                id: this.state.bulletCount + 1,
                x: player.x + 5,
                y: player.y + 17,
            };
            let bulletIncrement = 10;
            if (player.inverted) {
                bulletIncrement = -bulletIncrement;
            }
            this.setState({
                bulletCount: this.state.bulletCount + 1,
                bullets: this.state.bullets.concat(bullet)
            });
            bullet.bulletInterval = setInterval(() => {
                let newBullets = this.state.bullets;
                const newX = bullet.x + bulletIncrement;
                const collided = this.bulletIntersects({
                    height: 5,
                    width: 15,
                    x: newX,
                    y: bullet.y
                });
                if (collided || newX < 0 || newX > player.x + 1000) {
                    clearInterval(bullet.bulletInterval);
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
            const calls = Constants.JUMP_TIME / Constants.ANIMATION_FREQUENCY;
            const increment = Constants.JUMP_HEIGHT / Math.ceil(calls / 2);
            let call = 0;
            this.jumpInterval = setInterval(() => {
                player = this.props.player;
                const percent = call / calls;
                let newY = landY;
                let jumping = true;
                if (percent <= 0.5) { // On way up.
                    newY = player.y + increment;
                } else { // On way down.
                    newY = player.y - increment;
                    if (newY < landY) { // Jump over
                        newY = landY;
                        jumping = false;
                        clearInterval(this.jumpInterval);
                    } else { // Check for collision
                        const collision = this.willCollide(player);
                        if (collision.canMove) {
                            landY = collision.newY;
                            // Prevent falling through floor.
                            if (newY < landY) {
                                newY = landY;
                            }
                        }
                    }
                }
                call ++;
                this.props.dispatch(jumpMove(Math.round(newY), percent, jumping));
                this.checkPowerUps();
            }, Constants.ANIMATION_FREQUENCY);
        }
   }

   private moveEnemies = () => {
        this.props.level.enemies.forEach((enemy:any) => {
            if(enemy.maxX !== enemy.minX) {
                this.moveEnemy(enemy);
            }
        });
   }

   private moveEnemy(enemy: any){
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
       this.step(player.x <= Constants.STEP_WIDTH ? 0 : player.x - Constants.STEP_WIDTH, true);
   }

    private moveRight() {
        const player:IPlayer = this.props.player;
        this.step(player.x + Constants.STEP_WIDTH, false);
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
        }
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

    private step(wantedX:number, inverted:boolean) {
        if (isNaN(this.stepInterval)) {
            let player: IPlayer = this.props.player;
            this.props.dispatch(stepStart(inverted));
            const increment = wantedX - player.x;
            let newX = wantedX - increment;
            this.stepInterval = setInterval(() => {
                player = this.props.player;
                newX += increment;
                let stepping = true;
                const collision:ICollision = this.willCollide({
                    ...player,
                    x: newX
                });
                let levelOffset = this.state.levelOffset;
                if(!collision.canMove) {
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
                if (collision.isEnemy && !player.invulnerable) {
                    this.playerHit();
                }
                this.setState({
                    levelOffset
                });
                this.checkPowerUps();
                if (collision.canMove && !isNaN(collision.newY) && collision.newY !== player.y && !player.jumping && stepping) {
                    this.fall();
                }
                this.checkDoors();
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

    private willCollide(player: IPlayer): ICollision {
        const collision: ICollision = {
            canMove: true,
            isEnemy: false,
            newY: NaN,
            shape: null,
        }

        // Check for outside level.
        if(player.x < 0 || player.x + player.width >= this.props.level.width) {
            collision.canMove = false;
            return collision;
        }
        const platforms = this.props.level.platforms.filter((p:IShape) => {
            return (player.x + player.width > p.x && player.x < p.x + p.width);
        });
        let platform;
        if (platforms.length > 0) {
            // Pick highest.
            platforms.sort( (a:IShape, b:IShape) => {
                return b.y - a.y;
            });
            platform = platforms[0];
            collision.shape = platform;
            // Jumped/fell onto platform
            if (player.y >= platform.y) {
                collision.newY = platform.y + platform.height;
            } else if (intersects(player, platform)) {
                // Walked into platform.
                collision.canMove = false;
            }
            return collision;
              
        }
        // Enemies shouldn't overlap
        const enemy = this.props.level.enemies.find( (e:IShape) => {
            return intersects(player, e);
        });
        if (enemy) {
            collision.shape = enemy;
            collision.isEnemy = true;
        }
        // Check for falling off platform  
        if (player.y > 0) {
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