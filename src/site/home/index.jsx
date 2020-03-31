import React from 'react';
import { debounce } from 'lodash';
import { withTranslation, Trans } from 'react-i18next';
import { IconSearch, IconClose } from '../../components/Icons';
import DeliverToBar from '../../components/DeliverToBar';
import Banner from '../components/Banner';
import StoreList from './components/StoreList';
import { appActionCreators, getCurrentPlaceInfo } from '../redux/modules/app';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import './index.scss';
import Constants from '../../utils/constants';
import { homeActionCreators, getPaginationInfo, getSearchingStores, getAllCurrentStores } from '../redux/modules/home';
import { getPlaceInfo, savePlaceInfo } from './utils';
import Utils from '../../utils/utils';

const { ROUTER_PATHS, ADDRESS_RANGE } = Constants;

class Home extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      keyword: '',
    };
  }

  componentDidMount = async () => {
    const { paginationInfo } = this.props;
    const placeInfo = await getPlaceInfo(this.props);

    // if no placeInfo at all
    if (!placeInfo) {
      // return this.gotoLocationPage();
    }

    // placeInfo ok
    await savePlaceInfo(placeInfo); // now save into localStorage
    this.props.appActions.setCurrentPlaceInfo(placeInfo);

    console.log('[home] currentPlaceInfo =>', this.props.currentPlaceInfo);

    // fetch storeList here.
    // await this.props.homeActions.getStoreList({ ...this.props.currentPlaceInfo, ...paginationInfo });
  };

  debounceSearchStores = debounce(() => {
    const { keyword } = this.state;
    const { currentPlaceInfo } = this.props;

    this.props.homeActions.getSearchingStoreList({ keyword, ...currentPlaceInfo });
  }, 700);

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

  handleSearchTextChange = event => {
    const keyword = event.currentTarget.value;

    this.setState({ keyword }, () => {
      this.debounceSearchStores();
    });
  };

  handleClearSearchText = () => {
    this.setState({ keyword: '' });
  };

  handleLoadMoreStores = () => {
    const { currentPlaceInfo, paginationInfo } = this.props;

    if (!currentPlaceInfo || !paginationInfo) {
      console.warn(new Error('currentPlaceInfo is not ready'));
      return;
    }

    // fetch storeList here.
    this.props.homeActions.getStoreList({ ...currentPlaceInfo, ...paginationInfo });
  };

  render() {
    const { t, currentPlaceInfo, paginationInfo, stores, searchingStores } = this.props;
    const { keyword } = this.state;
    const { hasMore } = paginationInfo;
    const searchingStoresTEMP = [
      {
        id: '11111',
        name: '11111',
        avatar: '11111',
        street1: '11111',
        street2: '11111',
        city: 'KYM',
        state: '',
        country: 'MY',
        deliveryFee: 0,
        minimumConsumption: 0,
        geoDistance: 5,
        isOpen: true,
      },
    ];

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
              <input
                className="form__input"
                type="search"
                placeholder={t('SearchRestaurantPlaceholder')}
                onChange={this.handleSearchTextChange}
              />
              <IconClose
                className="icon icon__smaller icon__gray"
                onClick={this.handleClearSearchText}
                style={{ visibility: keyword ? 'visible' : 'hidden' }}
              />
            </div>
            <ul className="">
              {searchingStoresTEMP.map(store => {
                const { name, geoDistance } = store;

                return (
                  <li>
                    <h3 className="text-size-big text-weight-bold">{name}</h3>
                    <p className="flex flex-middle text-opacity">
                      <span>{(geoDistance || 0).toFixed(2)} km . </span>
                      <address>{Utils.getValidAddress(store, ADDRESS_RANGE.STATE)}</address>
                    </p>
                  </li>
                );
              })}
            </ul>
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
      searchingStores: getSearchingStores(state),
    }),
    dispatch => ({
      appActions: bindActionCreators(appActionCreators, dispatch),
      homeActions: bindActionCreators(homeActionCreators, dispatch),
    })
  )
)(Home);
