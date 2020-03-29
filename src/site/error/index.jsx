import React, { Component } from 'react';
import beepErrorImage from '../../images/beep-error.png';

class Error extends Component {
  render() {
    return (
      <main>
        <figure className="prompt-page__image-container text-center">
          <img src={beepErrorImage} alt="error found" />
        </figure>
      </main>
    );
  }
}

export default Error;
