import React, { Suspense } from 'react';
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
import { rootActionCreators } from '../redux/modules';
import {
  collectionCardActionCreators,
  getIconCollections,
  getBannerCollections,
  getCarouselCollections,
} from '../redux/modules/entities/storeCollections';
import { appActionCreators } from '../redux/modules/app';
import {
  getAllCurrentStores,
  getPaginationInfo,
  getStoreLinkInfo,
  homeActionCreators,
  getShouldShowCampaignBar,
} from '../redux/modules/home';
import CollectionCard from './components/CollectionCard';
import StoreList from '../components/StoreList';
// import CampaignBar from './containers/CampaignBar';
import './index.scss';
import { getPlaceInfo, getPlaceInfoByDeviceByAskPermission, submitStoreMenu } from './utils';
import { isSameAddressCoords, scrollTopPosition } from '../utils';
import { checkStateRestoreStatus } from '../redux/modules/index';
import Banners from './components/Banners';
import Carousel from './components/Carousel';
import BeepAppLink from './containers/CampaignBar/components/images/beep-app-link.jpg';
import DevToolsTrigger from '../../components/DevToolsTrigger';
import Utils from '../../utils/utils';
import {
  getAddressInfo as getAddress,
  getAddressId,
  getAddressCoords,
  getIfAddressInfoExists,
} from '../../redux/modules/address/selectors';
import { getAddressInfo, setAddressInfo } from '../../redux/modules/address/thunks';
import { ADDRESS_INFO_SOURCE_TYPE } from '../../redux/modules/address/constants';

const { ROUTER_PATHS /*ADDRESS_RANGE*/, COLLECTIONS_TYPE } = Constants;

class Home extends React.Component {
  static lastUsedAddressCoords = null;

  sectionRef = React.createRef();
  scrollTop = 0;

  state = {
    campaignShown: false,
  };

  constructor(props) {
    super(props);

    const {
      paginationInfo: { scrollTop },
    } = this.props;
    this.scrollTop = scrollTop || 0;
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
    if (!this.props.ifAddressInfoExists) {
      return this.gotoLocationPage();
    }

    // placeInfo ok
    this.reloadStoreListIfNecessary();

    await this.reloadAddressInfoByDeviceIfNeeded(source);

    CleverTap.pushEvent('Home Page - view home page');
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
    const { getAddressInfo } = this.props;

    if (this.props.ifAddressInfoExists) return FRONTEND_CACHE;

    // Get address from Redis
    await getAddressInfo();

    if (this.props.ifAddressInfoExists) return BACKEND_CACHE;

    // Get address from ip (or device for TNG Mini Program)
    const { placeInfo, source } = await getPlaceInfo({ fromDevice: Utils.isTNGMiniProgram() });

    const hasAddressInfo = !!placeInfo;
    if (hasAddressInfo) await this.updateAddressInfo(placeInfo);

    return source;
  };

  reloadAddressInfoByDeviceIfNeeded = async source => {
    if (source !== ADDRESS_INFO_SOURCE_TYPE.IP) return;

    try {
      const placeInfo = await getPlaceInfoByDeviceByAskPermission();
      if (placeInfo) await this.updateAddressInfo(placeInfo);
    } catch (e) {
      console.error('[Home] [didMount] error=%s', e);
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
    this.props.rootActions.backup();
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
    CleverTap.pushEvent('Homepage - Click Search Bar');
    this.backLeftPosition();
    this.props.history.push({ pathname: '/search' });
  };

  handleLoadMoreStores = () => {
    return this.props.homeActions.getStoreListNextPage();
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
    await submitStoreMenu({ deliveryAddress: addressInfo, store: store, source: document.location.href });
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
      <React.Fragment>
        <h2 className="sm:tw-px-16px tw-px-16 sm:tw-py-4px tw-py-4 tw-text-xl tw-font-bold tw-leading-normal">
          {t('NearbyRestaurants')}
        </h2>
        <StoreListAutoScroll
          getScrollParent={() => this.sectionRef.current}
          defaultScrollTop={scrollTop}
          onScroll={scrollTop => (this.scrollTop = scrollTop)}
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
      </React.Fragment>
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

    if (!ifAddressInfoExists) {
      return <i className="loader theme full-page text-size-huge" />;
    }

    return (
      <main className="entry fixed-wrapper fixed-wrapper__main" data-heap-name="site.home.container">
        <Header onLocationBarClick={this.gotoLocationPage} onQRScannerClick={this.handleQRCodeClicked} />
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
            <DevToolsTrigger>
              <figure className="entry-home__banner-image">
                <img src={MvpDeliveryBannerImage} alt="mvp home banner logo" />
              </figure>
            </DevToolsTrigger>
            <SearchBox onClick={this.handleLoadSearchPage} />
          </Banner>

          {shouldShowCampaignBar && (
            <a
              className="offer-details__bar"
              data-heap-name="site.home.campaign-bar"
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
    }),
    dispatch => ({
      getAddressInfo: bindActionCreators(getAddressInfo, dispatch),
      setAddressInfo: bindActionCreators(setAddressInfo, dispatch),
      rootActions: bindActionCreators(rootActionCreators, dispatch),
      appActions: bindActionCreators(appActionCreators, dispatch),
      homeActions: bindActionCreators(homeActionCreators, dispatch),
      collectionCardActions: bindActionCreators(collectionCardActionCreators, dispatch),
    })
  )
)(Home);
