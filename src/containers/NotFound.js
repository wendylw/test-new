import React, { Component } from 'react';

import '../Common.scss';
import '../App.scss';
export class NotFound extends Component {
  render() {
    return (
      <main className="table-ordering">
        <section className="table-ordering__prompt-page">
          <figure className="prompt-page__image-container text-center">
            <img src="/img/beep-error.png" alt="error found" />
          </figure>
          <div className="prompt-page__content">
            <h2 className="prompt-page__title text-center">Not Found!</h2>
            <div className="prompt-page__paragraphs text-center">
              <p>Sorry page not found</p>
            </div>
          </div>
        </section>
      </main>
    );
  }
}

export default NotFound;
