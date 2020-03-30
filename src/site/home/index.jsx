import React, { useEffect } from 'react';
import { withTranslation, Trans } from 'react-i18next';
import InfiniteScroll from 'react-infinite-scroller';
import { IconSearch } from '../../components/Icons';
import DeliverToBar from '../../components/DeliverToBar';
import Banner from '../components/Banner';
import StoreList from './components/StoreList';
import { appActionCreators, getCurrentPlaceInfo } from '../redux/modules/app';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import './index.scss';
import Constants from '../../utils/constants';

const { ROUTER_PATHS } = Constants;

class Home extends React.Component {
  componentDidMount = () => {
    this.setCurrentPlaceInfoRequest();
    this.getStoreListRequest();
  };

  setCurrentPlaceInfoRequest() {
    const { history, location, appActions } = this.props;

    console.log('[Home] history.location.state =', history.location.state);
    const { state = {} } = location || {};
    if (state.from && state.from.pathname === `${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_LOCATION}`) {
      appActions.setCurrentPlaceInfo(state.data.placeInfo);
    }
  }

  getStoreListRequest() {}

  gotoLocationPage = () => {
    const { history, location } = this.props;

    history.push({
      pathname: `${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_LOCATION}`,
      state: {
        from: location,
      },
    });
  };

  render() {
    const { t, currentPlaceInfo } = this.props;

    return (
      <main className="entry fixed-wrapper">
        <Banner
          title={
            <Trans i18nKey="DiscoverDescription">
              Discover new
              <br />
              restaurants around you
            </Trans>
          }
        />
        <DeliverToBar
          title={t('DeliverTo')}
          address={currentPlaceInfo ? currentPlaceInfo.address : ''}
          gotoLocationPage={this.gotoLocationPage}
        />
        <section className="entry-home fixed-wrapper__container wrapper">
          <div className="entry-home__search">
            <div className="form__group flex flex-middle">
              <IconSearch className="icon icon__normal icon__gray" />
              <input className="form__input" type="text" placeholder={t('SearchRestaurantPlaceholder')} />
            </div>
          </div>

          <div className="store-card-list__container padding-normal">
            <h2 className="text-size-biggest text-weight-bold">{t('NearbyRestaurants')}</h2>
            <InfiniteScroll></InfiniteScroll>
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
