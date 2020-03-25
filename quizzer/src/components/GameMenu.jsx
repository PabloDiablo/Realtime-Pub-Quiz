import React from "react";
import Menu from "./Menu";

class GameMenu extends React.Component {
  render() {
    return (
      <div>
        <div className="h-100 row align-items-center vh-100">
          <h1
            className="col-12 text-center display-2"
            style={{ color: "white" }}
          >
            <b>Pub Quiz</b>
            <br />
            <span className="display-3">Quarantine Quiz</span>
          </h1>
        </div>
      </div>
    );
  }
}

export default GameMenu;
