import React from 'react';
import { withTranslation, Trans } from 'react-i18next';
import { IconSearch } from '../../components/Icons';
import DeliverToBar from '../../components/DeliverToBar';
import Banner from '../components/Banner';
import StoreList from './components/StoreList';
import { appActionCreators, getCurrentPlaceInfo } from '../redux/modules/app';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import './index.scss';
import Constants from '../../utils/constants';
import { homeActionCreators, getPaginationInfo, getAllCurrentStores } from '../redux/modules/home';

const { ROUTER_PATHS } = Constants;

class Home extends React.Component {
  componentDidMount = async () => {
    const { paginationInfo } = this.props;
    const placeInfo = this.getPlaceInfoFromHistory();

    try {
      await this.props.homeActions.setupCurrentLocation(placeInfo);
    } catch (e) {
      console.warn('[home] failed to locate user by device');
      return this.gotoLocationPage();
    }

    console.log('[home] currentPlaceInfo =>', this.props.currentPlaceInfo);

    // fetch storeList here.
    await this.props.homeActions.getStoreList({ ...this.props.currentPlaceInfo, ...paginationInfo });
  };

  getPlaceInfoFromHistory() {
    const { history, location } = this.props;
    const { state = {} } = location || {};
    console.log('[Home] history.location.state =', history.location.state);

    if (state.from && state.from.pathname === `${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_LOCATION}`) {
      return state.data.placeInfo;
    }

    return null;
  }

  gotoLocationPage = () => {
    const { history, location, currentPlaceInfo } = this.props;
    const coords = currentPlaceInfo && currentPlaceInfo.coords;

    history.push({
      pathname: `${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_LOCATION}`,
      state: {
        from: location,
        coords,
      },
    });
  };

  handleLoadMoreStores = () => {
    const { currentPlaceInfo, paginationInfo } = this.props;

    // fetch storeList here.
    this.props.homeActions.getStoreList({ ...currentPlaceInfo, ...paginationInfo });
  };

  render() {
    const { t, currentPlaceInfo, paginationInfo, stores } = this.props;
    const { hasMore } = paginationInfo;

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
            <StoreList stores={stores} hasMore={hasMore} loadMoreStores={this.handleLoadMoreStores} />
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
      paginationInfo: getPaginationInfo(state),
      stores: getAllCurrentStores(state),
    }),
    dispatch => ({
      appActions: bindActionCreators(appActionCreators, dispatch),
      homeActions: bindActionCreators(homeActionCreators, dispatch),
    })
  )
)(Home);
