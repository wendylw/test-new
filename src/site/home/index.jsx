import React, { Suspense } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import _get from 'lodash/get';
import Header from './components/Header';
import SearchBox from './components/SearchBox';
import MvpDeliveryBannerImage from '../../images/mvp-delivery-banner.png';
import Constants from '../../utils/constants';
import CleverTap from '../../utils/clevertap';
import Banner from '../components/Banner';
import StoreListAutoScroll from '../components/StoreListAutoScroll';
import { rootActionCreators, checkStateRestoreStatus } from '../redux/modules';
import {
  collectionCardActionCreators,
  getIconCollections,
  getBannerCollections,
  getCarouselCollections,
} from '../redux/modules/entities/storeCollections';
import { appActionCreators, getIsAlipayMiniProgram } from '../redux/modules/app';
import {
  getAllCurrentStores,
  getPaginationInfo,
  getStoreLinkInfo,
  homeActionCreators,
  getShouldShowCampaignBar,
} from '../redux/modules/home';
import CollectionCard from './components/CollectionCard';
import StoreList from '../components/StoreList';
import './index.scss';
import { getPlaceInfo, getPlaceInfoByDeviceByAskPermission, submitStoreMenu } from './utils';
import { isSameAddressCoords, scrollTopPosition } from '../utils';
import Banners from './components/Banners';
import Carousel from './components/Carousel';
import BeepAppLink from '../../images/beep-app-link.jpg';
import DevToolsTrigger from '../../components/DevToolsTrigger';
import prefetch from '../../common/utils/prefetch-assets';
import Utils from '../../utils/utils';
import {
  getAddressInfo as getAddress,
  getAddressId,
  getAddressCoords,
  getIfAddressInfoExists,
} from '../../redux/modules/address/selectors';
import {
  getAddressInfo as getAddressInfoThunk,
  setAddressInfo as setAddressInfoThunk,
} from '../../redux/modules/address/thunks';
import { ADDRESS_INFO_SOURCE_TYPE } from '../../redux/modules/address/constants';

const { ROUTER_PATHS, COLLECTIONS_TYPE } = Constants;

class Home extends React.Component {
  static lastUsedAddressCoords = null;

  sectionRef = React.createRef();

  scrollTop = 0;

  constructor(props) {
    super(props);

    const {
      paginationInfo: { scrollTop },
    } = this.props;

    this.scrollTop = scrollTop || 0;
    this.state = {
      campaignShown: false,
    };
  }

  componentDidMount = async () => {
    if (checkStateRestoreStatus()) {
      const { getAddressInfo, addressCoords } = this.props;
      Home.lastUsedAddressCoords = addressCoords;
      getAddressInfo();
      return;
    }

    const source = await this.loadAddressInfo();

    // if no address info at all
    const { ifAddressInfoExists } = this.props;

    if (!ifAddressInfoExists) {
      this.gotoLocationPage();
      return;
    }

    // placeInfo ok
    this.reloadStoreListIfNecessary();

    await this.reloadAddressInfoByDeviceIfNeeded(source);

    CleverTap.pushEvent('Home Page - view home page');
    prefetch(['ORD_LOC'], ['OrderingDelivery']);
  };

  componentDidUpdate(prevProps) {
    const { addressCoords: prevAddressCoords } = prevProps;
    const { addressCoords: currAddressCoords } = this.props;

    if (!isSameAddressCoords(prevAddressCoords, currAddressCoords)) {
      scrollTopPosition(this.sectionRef.current);
      this.reloadStoreListIfNecessary();
    }
  }

  loadAddressInfo = async () => {
    const { FRONTEND_CACHE, BACKEND_CACHE } = ADDRESS_INFO_SOURCE_TYPE;
    const { getAddressInfo, isAlipayMiniProgram } = this.props;

    // eslint-disable-next-line react/destructuring-assignment
    if (this.props.ifAddressInfoExists) return FRONTEND_CACHE;

    // Get address from Redis
    await getAddressInfo();

    // eslint-disable-next-line react/destructuring-assignment
    if (this.props.ifAddressInfoExists) return BACKEND_CACHE;

    // TODO: Migrate isTNGMiniProgram to isAlipayMiniProgram
    // Get address from ip (or device for Alipay Program)
    const { placeInfo, source } = await getPlaceInfo({ fromDevice: Utils.isTNGMiniProgram() || isAlipayMiniProgram });

    const hasAddressInfo = !!placeInfo;
    if (hasAddressInfo) await this.updateAddressInfo(placeInfo);

    return source;
  };

  reloadAddressInfoByDeviceIfNeeded = async source => {
    if (source !== ADDRESS_INFO_SOURCE_TYPE.IP) return;

    try {
      const placeInfo = await getPlaceInfoByDeviceByAskPermission();
      if (placeInfo) await this.updateAddressInfo(placeInfo);
    } catch (error) {
      console.error('[Home] [didMount] error=%s', error.message);
    }
  };

  updateAddressInfo = async placeInfo => {
    const { setAddressInfo } = this.props;
    const {
      placeId,
      name: shortName,
      coords,
      address: fullName,
      addressComponents: { countryCode, postCode, city },
    } = placeInfo;

    await setAddressInfo({
      placeId,
      shortName,
      fullName,
      coords,
      countryCode,
      postCode,
      city,
    });
  };

  reloadStoreListIfNecessary = () => {
    const { addressCoords, homeActions, collectionCardActions } = this.props;

    if (isSameAddressCoords(Home.lastUsedAddressCoords, addressCoords)) return;

    collectionCardActions.getCollections(COLLECTIONS_TYPE.ICON);
    collectionCardActions.getCollections(COLLECTIONS_TYPE.BANNER);
    collectionCardActions.getCollections(COLLECTIONS_TYPE.CAROUSEL);
    homeActions.reloadStoreList();

    Home.lastUsedAddressCoords = addressCoords;
  };

  backupState = () => {
    const { rootActions } = this.props;

    rootActions.backup();
  };

  gotoLocationPage = () => {
    CleverTap.pushEvent('Homepage - Click Location Bar');

    const { history, location, addressCoords: coords } = this.props;

    history.push({
      pathname: `${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_LOCATION}`,
      state: {
        from: location,
        coords,
      },
    });
  };

  handleLoadSearchPage = () => {
    const { history } = this.props;

    CleverTap.pushEvent('Homepage - Click Search Bar');
    this.backLeftPosition();
    history.push({ pathname: '/search' });
  };

  handleLoadMoreStores = () => {
    const { homeActions } = this.props;
    return homeActions.getStoreListNextPage();
  };

  handleStoreSelected = async (store, index) => {
    CleverTap.pushEvent('Homepage - Click Store Card', {
      'store name': store.name,
      'store rank': index + 1,
      'shipping type': store.shippingType,
      'has promo': store.promoTag?.length > 0,
      cashback: store.cashbackRate || 0,
      distance: store.geoDistance,
      'has lowest price': _get(store, 'isLowestPrice', false),
    });

    const { homeActions, addressInfo } = this.props;

    homeActions.setPaginationInfo({ scrollTop: this.scrollTop });

    // to backup whole redux state when click store item
    this.backupState();
    await submitStoreMenu({ deliveryAddress: addressInfo, store, source: document.location.href });
  };

  handleQRCodeClicked = () => {
    CleverTap.pushEvent('Homepage - Click QR Scan');
    this.backLeftPosition();
  };

  backLeftPosition = () => {
    const { homeActions } = this.props;

    homeActions.setPaginationInfo({ scrollTop: this.scrollTop });
  };

  renderStoreList = () => {
    const {
      t,
      stores,
      addressId,
      paginationInfo: { hasMore, scrollTop },
    } = this.props;

    return (
      <>
        <h2 className="sm:tw-px-16px tw-px-16 sm:tw-py-4px tw-py-4 tw-text-xl tw-font-bold tw-leading-normal">
          {t('NearbyRestaurants')}
        </h2>
        <StoreListAutoScroll
          getScrollParent={() => this.sectionRef.current}
          defaultScrollTop={scrollTop}
          onScroll={top => {
            this.scrollTop = top;
          }}
        >
          <StoreList
            key={`store-list-${addressId}`}
            stores={stores}
            hasMore={hasMore}
            loadMoreStores={this.handleLoadMoreStores}
            onStoreClicked={this.handleStoreSelected}
            getScrollParent={() => this.sectionRef.current}
            withInfiniteScroll
          />
        </StoreListAutoScroll>
      </>
    );
  };

  render() {
    const {
      addressCoords,
      storeCollections,
      bannerCollections,
      ifAddressInfoExists,
      carouselCollections,
      shouldShowCampaignBar,
    } = this.props;

    const { campaignShown } = this.state;

    if (!ifAddressInfoExists) {
      return <i className="loader theme full-page text-size-huge" />;
    }

    return (
      <main className="entry fixed-wrapper fixed-wrapper__main" data-test-id="site.home.container">
        <Header onLocationBarClick={this.gotoLocationPage} onQRScannerClick={this.handleQRCodeClicked} />
        <section
          ref={this.sectionRef}
          className="entry-home fixed-wrapper__container wrapper"
          style={{
            // quick fix to style: modal close bar is covered by "DELIVER TO" bar
            // Remove this and browse with Safari, open the campaign bar, you will see.
            zIndex: campaignShown ? 100 : 'auto',
          }}
        >
          <Banner className="entry-home__banner">
            <DevToolsTrigger>
              <figure className="entry-home__banner-image">
                <img src={MvpDeliveryBannerImage} alt="mvp home banner logo" />
              </figure>
            </DevToolsTrigger>
            <SearchBox onClick={this.handleLoadSearchPage} data-test-id="site.home.search-box" />
          </Banner>

          {shouldShowCampaignBar && (
            <a
              className="offer-details__bar"
              data-test-id="site.home.campaign-bar"
              target="_blank"
              href="https://storehub.page.link/pzok"
              rel="noopener noreferrer"
            >
              <p className="flex flex-middle flex-center">
                <img className="offer-details__bar-image" src={BeepAppLink} alt="" />
              </p>
            </a>
          )}

          <Suspense fallback={null}>
            <CollectionCard collections={storeCollections} backLeftPosition={this.backLeftPosition} />
          </Suspense>

          <Banners collections={bannerCollections} />

          <Carousel collections={carouselCollections} />

          <div className="sm:tw-py-4px tw-py-4">{addressCoords ? this.renderStoreList() : null}</div>
        </section>
      </main>
    );
  }
}

Home.displayName = 'Home';

Home.propTypes = {
  /* eslint-disable react/forbid-prop-types */
  isAlipayMiniProgram: PropTypes.bool,
  stores: PropTypes.array,
  storeCollections: PropTypes.array,
  bannerCollections: PropTypes.array,
  carouselCollections: PropTypes.array,
  paginationInfo: PropTypes.object,
  addressInfo: PropTypes.object,
  location: PropTypes.object,
  /* eslint-enable */
  addressId: PropTypes.string,
  getAddressInfo: PropTypes.func,
  setAddressInfo: PropTypes.func,
  addressCoords: PropTypes.shape({
    lat: PropTypes.number,
    lng: PropTypes.number,
  }),
  ifAddressInfoExists: PropTypes.bool,
  shouldShowCampaignBar: PropTypes.bool,
  rootActions: PropTypes.shape({
    backup: PropTypes.func,
  }),
  homeActions: PropTypes.shape({
    reloadStoreList: PropTypes.func,
    setPaginationInfo: PropTypes.func,
    getStoreListNextPage: PropTypes.func,
  }),
  collectionCardActions: PropTypes.shape({
    getCollections: PropTypes.func,
  }),
};

Home.defaultProps = {
  stores: [],
  addressId: '',
  paginationInfo: {},
  getAddressInfo: () => {},
  setAddressInfo: () => {},
  location: null,
  addressInfo: null,
  addressCoords: null,
  storeCollections: [],
  bannerCollections: [],
  carouselCollections: [],
  isAlipayMiniProgram: false,
  ifAddressInfoExists: false,
  shouldShowCampaignBar: false,
  rootActions: {
    backup: () => {},
  },
  homeActions: {
    reloadStoreList: () => {},
    setPaginationInfo: () => {},
    getStoreListNextPage: () => {},
  },
  collectionCardActions: {
    getCollections: () => {},
  },
};

export default compose(
  withTranslation(),
  connect(
    state => ({
      addressInfo: getAddress(state),
      addressId: getAddressId(state),
      stores: getAllCurrentStores(state),
      addressCoords: getAddressCoords(state),
      storeLinkInfo: getStoreLinkInfo(state),
      paginationInfo: getPaginationInfo(state),
      storeCollections: getIconCollections(state),
      bannerCollections: getBannerCollections(state),
      carouselCollections: getCarouselCollections(state),
      ifAddressInfoExists: getIfAddressInfoExists(state),
      shouldShowCampaignBar: getShouldShowCampaignBar(state),
      isAlipayMiniProgram: getIsAlipayMiniProgram(state),
    }),
    dispatch => ({
      getAddressInfo: bindActionCreators(getAddressInfoThunk, dispatch),
      setAddressInfo: bindActionCreators(setAddressInfoThunk, dispatch),
      rootActions: bindActionCreators(rootActionCreators, dispatch),
      appActions: bindActionCreators(appActionCreators, dispatch),
      homeActions: bindActionCreators(homeActionCreators, dispatch),
      collectionCardActions: bindActionCreators(collectionCardActionCreators, dispatch),
    })
  )
)(Home);
