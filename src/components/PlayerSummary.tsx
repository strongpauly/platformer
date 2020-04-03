import * as React from "react";
import { IInitializedLevel } from "src/model/ILevel";
import { IPlayer } from "..//model/IPlayer";
import "./PlayerSummary.css";

interface IPlayerSummary {
  player: IPlayer;
  level: IInitializedLevel;
}

export class PlayerSummary extends React.Component<IPlayerSummary> {
  public render() {
    const { player, level } = this.props;
    return (
      <div className="player-summary">
        <div>Level: {level.name}</div>
        <div className="hit-points">{new Array(player.hp).fill("❤")}</div>
        <div>Score: {player.score}</div>
        {player.hasGun && <div>Bullets: {player.bullets}</div>}
      </div>
    );
  }
}
