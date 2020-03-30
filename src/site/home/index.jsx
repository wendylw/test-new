import React, { useEffect } from 'react';
import { withTranslation } from 'react-i18next';
import { IconSearch } from '../../components/Icons';
import DeliverToBar from '../../components/DeliverToBar';
import Banner from './components/Banner';
import StoreList from './components/StoreList';
import { appActionCreators, getCurrentPlaceInfo } from '../redux/modules/app';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';

class Home extends React.Component {
  componentDidMount = () => {
    const { history, location, appActions } = this.props;

    console.log('[Home] history.location.state =', history.location.state);
    const { state = {} } = location || {};
    if (state.from && state.from.pathname === '/ordering/location') {
      appActions.setCurrentPlaceInfo(state.data.placeInfo);
    }
  };

  gotoLocationPage = () => {
    const { history, location } = this.props;

    history.push({
      pathname: '/ordering/location',
      state: {
        from: location,
      },
    });
  };

  render() {
    const { t, currentPlaceInfo } = this.props;
    return (
      <main className="entry fixed-wrapper">
        <Banner />
        <DeliverToBar
          title={t('DeliverTo')}
          address={currentPlaceInfo ? currentPlaceInfo.address : ''}
          gotoLocationPage={this.gotoLocationPage}
        />
        <section className="entry-home wrapper">
          <div className="entry-home__search">
            <div className="form__group flex flex-middle">
              <IconSearch className="icon icon__normal icon__gray" />
              <input className="form__input" type="text" placeholder={t('SearchRestaurantPlaceholder')} />
            </div>
          </div>

          <div className="store-card-list__container padding-normal">
            <h2 className="text-size-biggest text-weight-bold">{t('NearbyRestaurants')}</h2>
            <StoreList />
          </div>
        </section>
      </main>
    );
  }
}

export default compose(
  withTranslation(),
  connect(
    state => ({
      currentPlaceInfo: getCurrentPlaceInfo(state),
    }),
    dispatch => ({
      appActions: bindActionCreators(appActionCreators, dispatch),
    })
  )
)(Home);
