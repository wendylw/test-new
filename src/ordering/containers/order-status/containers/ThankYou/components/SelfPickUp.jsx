import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { compose } from 'redux';
import './SelfPickUp.scss';

function SelfPickUp({ t }) {
  return (
    <section className="self-pickup">
      <div className="card text-center padding-normal margin-normal">
        <h2 className="self-pickup__title">{t('SelfPickUpTitle')}</h2>
        <p className="padding-top-bottom-normal padding-left-right-small text-line-height-higher">
          {t('SelfPickUpDescription')}
        </p>
        <button className="button button__block button__fill text-uppercase text-weight-bolder">
          {t('SwitchToSelfPickUp')}
        </button>
      </div>
    </section>
  );
}

SelfPickUp.propTypes = {};

SelfPickUp.defaultProps = {};

export default compose(withTranslation('OrderingThankYou'))(SelfPickUp);
