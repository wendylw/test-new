import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import Header from '../../../components/Header';

class SearchLocation extends Component {
  render() {
    const { t } = this.props;

    return (
      <section className="search-location">
        <Header className="border__bottom-divider gray has-right" isPage={true} title={t('DeliverTo')} />
      </section>
    );
  }
}

SearchLocation.propTypes = {};

SearchLocation.defaultProps = {};

export default withTranslation()(SearchLocation);
