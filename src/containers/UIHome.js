import React, { Component } from "react";
// Can import scss files here.
// https://facebook.github.io/create-react-app/docs/adding-a-sass-stylesheet
import './UIHome.scss';

export default class UIHome extends Component {
  render() {
    return (
      <div className="UIHome">
        <div className="lander">
          <h1>Scratch</h1>
          <p>A simple note taking app</p>
        </div>
      </div>
    );
  }
}
