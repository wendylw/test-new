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
import config from '../../config';

const { ROUTER_PATHS, ADDRESS_RANGE } = Constants;

class Home extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      keyword: '',
    };

    this.sectionRef = React.createRef();
  }

  componentDidMount = async () => {
    const placeInfo = await getPlaceInfo(this.props);

    // if no placeInfo at all
    if (!placeInfo) {
      return this.gotoLocationPage();
    }

    // placeInfo ok
    await savePlaceInfo(placeInfo); // now save into localStorage
    await this.props.appActions.setCurrentPlaceInfo(placeInfo);
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

  handleLoadMoreStores = page => {
    console.info('[Home] handleLoadMoreStores props =>', page);
    return this.props.homeActions.getStoreList(page);
  };

  handleStoreSelected = store => {
    console.log('[Home] handleStoreSelected store =', store);
    const storeUrl = `${config.beepOnlineStoreUrl(store.business)}?storeId=${store.id}`;
    console.warn('[Home] handleStoreSelected redirect to storeUrl =', storeUrl);
    window.location.href = storeUrl;
  };

  render() {
    const { t, currentPlaceInfo, paginationInfo, stores, searchingStores } = this.props;
    const { keyword } = this.state;
    const { hasMore } = paginationInfo;

    // current placeInfo is required.
    if (!currentPlaceInfo) {
      return null;
    }

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
        <section ref={this.sectionRef} className="entry-home fixed-wrapper__container wrapper">
          <div className="entry-home__search">
            <div className="form__group flex flex-middle">
              <IconSearch className="icon icon__normal icon__gray" />
              <input
                className="form__input"
                type="type"
                placeholder={t('SearchRestaurantPlaceholder')}
                value={keyword}
                onChange={this.handleSearchTextChange}
              />
              <IconClose
                className="form__search-icon icon icon__small icon__gray"
                onClick={this.handleClearSearchText}
                style={{ visibility: keyword ? 'visible' : 'hidden' }}
              />
            </div>
            {!searchingStores || !searchingStores.length || !keyword ? null : (
              <ul className="searching-list border__bottom-divider border-radius-base base-box-shadow">
                {searchingStores.map(store => {
                  const { name, geoDistance } = store;

                  return (
                    <li
                      className="searching-list__item border__bottom-divider"
                      onClick={this.handleStoreSelected(store)}
                    >
                      <h3 className="searching-list__name text-size-big text-weight-bold">{name}</h3>
                      <p className="searching-list__location flex flex-middle text-opacity">
                        <span>{`${t('DistanceText', { distance: (geoDistance || 0).toFixed(2) })} . `}</span>
                        <address>{Utils.getValidAddress(store, ADDRESS_RANGE.STATE)}</address>
                      </p>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="store-card-list__container padding-normal">
            <h2 className="text-size-biggest text-weight-bold">{t('NearbyRestaurants')}</h2>
            {currentPlaceInfo.coords ? (
              <StoreList
                stores={stores}
                hasMore={hasMore}
                loadMoreStores={this.handleLoadMoreStores}
                onStoreClicked={this.handleStoreSelected}
                getScrollParent={() => this.sectionRef.current}
              />
            ) : null}
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
