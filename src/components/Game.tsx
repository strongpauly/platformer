import * as React from 'react';
import {connect} from 'react-redux';
import './Game.css';
import {Player} from './Player';

class Game extends React.Component<any, any> {
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
                jumping: true,
                y: baseY + 20
              });
              setTimeout( () => {
                  this.setState({
                      jumping: false,
                      y: baseY
                  });
              }, 250);
        }
   }

    private onKeyPress = (event: KeyboardEvent) => {
        switch (event.key) {
            case "ArrowLeft" :
                this.setState({
                    x: this.state.x <= 10 ? 0 : this.state.x - 10
                });
            break;
            case "ArrowRight" :
                this.setState({
                    x: this.state.x + 10
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