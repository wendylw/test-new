import React, { Component } from 'react';

import '../Common.scss';

export class NotFound extends Component {
  render() {
    const { title, message } = this.props;

    return (
      <section className="table-ordering__prompt-page">
        <figure className="prompt-page__image-container text-center">
          <img src="/img/beep-error.png" alt="error found" />
        </figure>
        <div className="prompt-page__content">
          <h2 className="prompt-page__title text-center">{title}</h2>
          <div className="prompt-page__paragraphs">
            <p>{message}</p>
          </div>
        </div>
      </section>
    );
  }
}

export default NotFound;
