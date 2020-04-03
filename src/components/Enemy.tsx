import * as React from "react";
import { IPosition } from "../model/IPosition";
import "./Enemy.css";

export class Enemy extends React.Component<any, any> {
  constructor(props: React.Props<IPosition>) {
    super(props);
  }

  public render() {
    const style = {
      bottom: this.props.y,
      height: this.props.height,
      left: this.props.x,
      width: this.props.width
    };
    const classes = ["enemy"];
    if (this.props.inverted) {
      classes.push("inverted");
    }
    classes.push("enemy-move-" + (this.props.x % 3));
    if (this.props.hit) {
      classes.push("hit");
    }
    return <div className={classes.join(" ")} style={style} />;
  }
}
