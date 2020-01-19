import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Constants from '../utils/constants';

import '../Common.scss';
import '../App.scss';
export class NotFound extends Component {
  render() {
    const { title, message } = this.props;

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
