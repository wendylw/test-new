import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';

import '../Common.scss';
import '../App.scss';
import beepErrorImage from '../images/beep-error.png';

export class NotFound extends Component {
  render() {
    const { t } = this.props;

    return (
      <main className="table-ordering">
        <section className="table-ordering__prompt-page">
          <figure className="prompt-page__image-container text-center">
            <img src={beepErrorImage} alt="error found" />
          </figure>
          <div className="prompt-page__content">
            <h2 className="prompt-page__title text-center">{`${t('NotFound')}!`}</h2>
            <div className="prompt-page__paragraphs text-center">
              <p>{t('PageNotFound')}</p>
            </div>
          </div>
        </section>
      </main>
    );
  }
}

export default withTranslation()(NotFound);
