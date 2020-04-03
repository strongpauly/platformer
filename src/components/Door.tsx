import * as React from "react";
import { IPosition } from "../model/IPosition";
import "./Door.css";

export class Door extends React.Component<any, any> {
  constructor(props: React.Props<IPosition>) {
    super(props);
  }

  public render() {
    const style = {
      bottom: this.props.y,
      left: this.props.x
    };
    const classes = ["door"];
    if (this.props.open) {
      classes.push("door-open");
    }
    return <div className={classes.join(" ")} style={style} />;
  }
}
