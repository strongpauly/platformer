import * as React from "react";
import { IPlayer } from "..//model/IPlayer";
import "./PlayerSummary.css";

interface IPlayerSummary {
  player: IPlayer;
}

export class PlayerSummary extends React.Component<IPlayerSummary> {
  public render() {
    const { player } = this.props;
    return (
      <div className="player-summary">
        <div className="hit-points">{new Array(player.hp).fill("❤")}</div>
        <div>Score: {player.score}</div>
        {player.hasGun && <div>Bullets: {player.bullets}</div>}
      </div>
    );
  }
}
