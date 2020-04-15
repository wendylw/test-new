import React from 'react';
import { debounce } from 'lodash';
import { withTranslation } from 'react-i18next';
import './index.scss';
import { IconSearch, IconClose } from '../../components/Icons';
import DeliverToBar from '../../components/DeliverToBar';
import Banner from '../components/Banner';
import StoreList from './components/StoreList';
import TypeGuider from './components/TypeGuider';
import OfferDetails from './components/OfferDetails';
import { appActionCreators, getCurrentPlaceInfo } from '../redux/modules/app';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import Constants from '../../utils/constants';
import Utils from '../../utils/utils';
import {
  homeActionCreators,
  getPaginationInfo,
  getSearchingStores,
  loadedSearchingStores,
  getAllCurrentStores,
  getSearchResult,
  getTypePicker,
  getSearchInfo,
} from '../redux/modules/home';
import { getPlaceInfo, getPlaceInfoByDeviceByAskPermission } from './utils';
import MvpNotFoundImage from '../../images/mvp-not-found.png';
import MvpDeliveryBannerImage from '../../images/mvp-delivery-banner.png';
import { getCountryCodeByPlaceInfo } from '../../utils/geoUtils';
import { rootActionCreators } from '../redux/modules';
import StoreListAutoScroll from '../components/StoreListAutoScroll';

const { ROUTER_PATHS /*ADDRESS_RANGE*/ } = Constants;

class Home extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      campaignShown: false,
    };

    this.restoreState();

    const { paginationInfo, searchInfo } = this.props;
    const { scrollTop } = paginationInfo;
    const { scrollTop: scrollTopOfSearch } = searchInfo;

    this.scrollTop = scrollTop || 0;
    this.scrollTopOfSearch = scrollTopOfSearch || 0;

    this.renderId = `${Date.now()}`;
    this.sectionRef = React.createRef();
  }

  componentDidMount = async () => {
    const { history, location } = this.props;
    const { placeInfo, source } = await getPlaceInfo(this.props);

    // if no placeInfo at all
    if (!placeInfo) {
      return this.gotoLocationPage();
    }

    // placeInfo ok
    this.props.appActions.setCurrentPlaceInfo(placeInfo);

    // todo: need to reset store list instead of refresh the whole page
    if (source === 'location-page') {
      history.replace(location.pathname, {});
      window.location.reload();
      return;
    }

    // when source is from ip, we have to ask for high accuracy location
    if (source === 'ip') {
      try {
        const placeInfo = await getPlaceInfoByDeviceByAskPermission();
        if (placeInfo) {
          // this.props.appActions.setCurrentPlaceInfo(placeInfo);
          // info: refresh because appActions.setCurrentPlaceInfo won't trigger store list rerender because of InfiniteScroll bug
          window.location.reload();
          return;
        }
      } catch (e) {
        console.error('[Home] [didMount] error=%s', e);
      }
    }

    this.props.homeActions.getStoreList();

    if (Utils.getUserAgentInfo().browser.includes('Safari')) {
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.height = '100%';
      document.body.style.overflow = 'hidden';
    }
  };

  backupState = () => {
    this.props.rootActions.backup();
  };

  restoreState = () => {
    this.props.rootActions.restore();
  };

  debounceSearchStores = debounce(() => {
    const { currentPlaceInfo } = this.props;

    this.props.homeActions.getSearchingStoreList(currentPlaceInfo);
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

    this.props.homeActions.setSearchingStoresStatus(false);
    this.props.homeActions.setPaginationInfo({ scrollTop: 0 });
    this.props.homeActions.setSearchInfo({ keyword, scrollTop: 0 });
    this.debounceSearchStores();
  };

  handleClearSearchText = () => {
    this.props.homeActions.setSearchInfo({ keyword: '', scrollTop: 0 });
  };

  handleLoadMoreStores = () => {
    return this.props.homeActions.getStoreList();
  };

  handleStoreSelected = mode => async store => {
    const { homeActions } = this.props;

    if (mode === 'search') {
      homeActions.setSearchInfo({ scrollTop: this.scrollTopOfSearch });
    } else if (mode === 'stores') {
      homeActions.setPaginationInfo({ scrollTop: this.scrollTop });
    }

    // to backup whole redux state when click store item
    this.backupState();

    await homeActions.showTypePicker({
      business: store.business,
      storeId: store.id,
      isOpen: store.isOpen,
      isOutOfDeliveryRange: store.isOutOfDeliveryRange,
    });
  };

  renderStoreList = () => {
    const {
      t,
      stores,
      paginationInfo: { hasMore, scrollTop },
    } = this.props;

    // Caution:
    // 1. scroll restore will not work if you remove !this.sectionRef.current
    // 2. <StoreList /> pagination will not good if you remove !stores.length
    if (!stores.length || !this.sectionRef.current) {
      return null;
    }

    return (
      <React.Fragment>
        <h2 className="text-size-biggest text-weight-bold">{t('NearbyRestaurants')}</h2>
        <StoreListAutoScroll
          getScrollParent={() => this.sectionRef.current}
          defaultScrollTop={scrollTop}
          onScroll={scrollTop => (this.scrollTop = scrollTop)}
        >
          <StoreList
            key={`store-list-${this.renderId}`}
            stores={stores}
            hasMore={hasMore}
            loadMoreStores={this.handleLoadMoreStores}
            onStoreClicked={this.handleStoreSelected('stores')}
            getScrollParent={() => this.sectionRef.current}
            withInfiniteScroll
          />
        </StoreListAutoScroll>
      </React.Fragment>
    );
  };

  renderSearchResult = () => {
    const {
      t,
      searchInfo,
      searchResult,
      currentPlaceInfo: { coords },
      loadedSearchingStores,
    } = this.props;
    const { keyword, scrollTop } = searchInfo;

    if (Boolean(keyword) && !loadedSearchingStores) {
      return <div className="entry-home__huge-loader loader theme text-size-huge" />;
    }

    return (
      <React.Fragment>
        {searchResult.length && loadedSearchingStores ? null : (
          <div className="text-center">
            <img className="entry-home__hero-image" src={MvpNotFoundImage} alt="store not found" />
            <p className="entry-home__prompt-text text-size-big text-opacity">
              {t('SearchNotFoundStoreDescription', { keyword })}
            </p>
          </div>
        )}
        {searchResult.length && this.sectionRef.current ? (
          <StoreListAutoScroll
            getScrollParent={() => this.sectionRef.current}
            defaultScrollTop={scrollTop}
            onScroll={scrollTop => (this.scrollTopOfSearch = scrollTop)}
          >
            <StoreList
              key={`research-result-${coords.lng}-${coords.lat}`}
              stores={searchResult}
              onStoreClicked={this.handleStoreSelected('search')}
            />
          </StoreListAutoScroll>
        ) : null}
      </React.Fragment>
    );
  };

  render() {
    const { t, currentPlaceInfo, searchInfo, typePicker } = this.props;
    const { keyword } = searchInfo;

    if (!currentPlaceInfo) {
      return <i className="loader theme full-page text-size-huge"></i>;
    }

    const countryCode = getCountryCodeByPlaceInfo(currentPlaceInfo);

    return (
      <main className="entry fixed-wrapper fixed-wrapper__main">
        <DeliverToBar
          title={t('DeliverTo')}
          className={`entry__deliver-to base-box-shadow ${
            this.state.campaignShown ? 'absolute-wrapper' : 'sticky-wrapper'
          }`}
          address={currentPlaceInfo ? currentPlaceInfo.address : ''}
          gotoLocationPage={this.gotoLocationPage}
        />

        <section
          ref={this.sectionRef}
          className="entry-home fixed-wrapper__container wrapper"
          style={{
            // quick fix to style: modal close bar is covered by "DELIVER TO" bar
            // Remove this and browse with Safari, open the campaign bar, you will see.
            zIndex: this.state.campaignShown ? 100 : 'auto',
          }}
        >
          <Banner className="entry-home__banner">
            <figure className="entry-home__banner-image">
              <img src={MvpDeliveryBannerImage} alt="mvp home banner logo" />
            </figure>

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
            </div>
          </Banner>

          {countryCode.toUpperCase() === 'MY' ? (
            <OfferDetails
              onToggle={() => {
                this.setState({ campaignShown: !this.state.campaignShown });
              }}
            />
          ) : null}

          <div className="store-card-list__container padding-normal">
            {currentPlaceInfo.coords ? (Boolean(keyword) ? this.renderSearchResult() : this.renderStoreList()) : null}
          </div>
        </section>
        <TypeGuider
          {...typePicker}
          deliveryAddress={currentPlaceInfo}
          onToggle={() => this.props.homeActions.hideTypePicker()}
          onRedirect={() => this.props.homeActions.hideTypePicker()}
        />
      </main>
    );
  }
}

export default compose(
  withTranslation(),
  connect(
    state => ({
      currentPlaceInfo: getCurrentPlaceInfo(state),
      searchInfo: getSearchInfo(state),
      paginationInfo: getPaginationInfo(state),
      stores: getAllCurrentStores(state),
      searchingStores: getSearchingStores(state),
      searchResult: getSearchResult(state),
      loadedSearchingStores: loadedSearchingStores(state),
      typePicker: getTypePicker(state),
    }),
    dispatch => ({
      rootActions: bindActionCreators(rootActionCreators, dispatch),
      appActions: bindActionCreators(appActionCreators, dispatch),
      homeActions: bindActionCreators(homeActionCreators, dispatch),
    })
  )
)(Home);
