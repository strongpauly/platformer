import * as React from "react";
import { IPosition } from "../model/IPosition";
import "./Bullet.css";

export class Bullet extends React.Component<IPosition> {
  public render() {
    const style = {
      bottom: this.props.y,
      left: this.props.x
    };
    return <div className="bullet" style={style} />;
  }
}
