import React, { Suspense } from 'react';
import { Link } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import DeliverToBar from '../../components/DeliverToBar';
import { IconSearch, IconScanner, IconLocation } from '../../components/Icons';
import MvpDeliveryBannerImage from '../../images/mvp-delivery-banner.png';
import Constants from '../../utils/constants';
import { getCountryCodeByPlaceInfo } from '../../utils/geoUtils';
import Banner from '../components/Banner';
import StoreListAutoScroll from '../components/StoreListAutoScroll';
import { rootActionCreators } from '../redux/modules';
import {
  collectionCardActionCreators,
  getIconCollections,
  getBannerCollections,
} from '../redux/modules/entities/storeCollections';
import { appActionCreators, getCurrentPlaceInfo, getCurrentPlaceId } from '../redux/modules/app';
import { getAllCurrentStores, getPaginationInfo, getStoreLinkInfo, homeActionCreators } from '../redux/modules/home';
import CollectionCard from './components/CollectionCard';
import StoreList from './components/StoreList';
// import CampaignBar from './containers/CampaignBar';
import './index.scss';
import { getPlaceInfo, getPlaceInfoByDeviceByAskPermission, submitStoreMenu } from './utils';
import { checkStateRestoreStatus } from '../redux/modules/index';
import Banners from './components/Banners';
import BeepAppLink from './containers/CampaignBar/components/images/beep-app-link.jpg';

const { ROUTER_PATHS /*ADDRESS_RANGE*/, COLLECTIONS_TYPE } = Constants;
const isCampaignActive = true; // feature switch

class Home extends React.Component {
  static lastUsedPlaceId = null;

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
      return;
    }
    const { location } = this.props;
    const { placeInfo, source } = await getPlaceInfo({ location, fromDevice: false });

    // if no placeInfo at all
    if (!placeInfo) {
      return this.gotoLocationPage();
    }

    // placeInfo ok
    this.props.appActions.setCurrentPlaceInfo(placeInfo, source);

    this.reloadStoreListIfNecessary();

    if (source === 'ip') {
      this.getPlaceInfoByDevice();
    }
  };

  componentDidUpdate(prevProps) {
    if (this.props.currentPlaceId !== prevProps.currentPlaceId) {
      this.reloadStoreListIfNecessary();
    }
  }

  async getPlaceInfoByDevice() {
    try {
      const placeInfo = await getPlaceInfoByDeviceByAskPermission();
      if (placeInfo) {
        this.props.appActions.setCurrentPlaceInfo(placeInfo, 'device');
      }
    } catch (e) {
      console.error('[Home] [didMount] error=%s', e);
    }
  }

  reloadStoreListIfNecessary = () => {
    if (this.props.currentPlaceId !== Home.lastUsedPlaceId) {
      this.props.collectionCardActions.getCollections(COLLECTIONS_TYPE.ICON);
      this.props.collectionCardActions.getCollections(COLLECTIONS_TYPE.BANNER);
      this.props.homeActions.reloadStoreList();
      Home.lastUsedPlaceId = this.props.currentPlaceId;
    }
  };

  backupState = () => {
    this.props.rootActions.backup();
  };

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

  handleLoadSearchPage = () => {
    this.backLeftPosition();
    this.props.history.push({ pathname: '/search' });
  };

  handleLoadMoreStores = () => {
    return this.props.homeActions.getStoreListNextPage();
  };

  handleStoreSelected = async store => {
    const { homeActions, currentPlaceInfo } = this.props;

    homeActions.setPaginationInfo({ scrollTop: this.scrollTop });

    // to backup whole redux state when click store item
    this.backupState();
    await submitStoreMenu({ deliveryAddress: currentPlaceInfo, store: store, source: document.location.href });
  };

  backLeftPosition = () => {
    const { homeActions } = this.props;

    homeActions.setPaginationInfo({ scrollTop: this.scrollTop });
  };

  renderStoreList = () => {
    const {
      t,
      stores,
      currentPlaceId,
      paginationInfo: { hasMore, scrollTop },
    } = this.props;

    return (
      <React.Fragment>
        <h2 className="text-size-biggest text-weight-bolder">{t('NearbyRestaurants')}</h2>
        <StoreListAutoScroll
          getScrollParent={() => this.sectionRef.current}
          defaultScrollTop={scrollTop}
          onScroll={scrollTop => (this.scrollTop = scrollTop)}
        >
          <StoreList
            key={`store-list-${currentPlaceId}`}
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
    const { t, currentPlaceInfo, storeCollections, bannerCollections } = this.props;

    if (!currentPlaceInfo) {
      return <i className="loader theme full-page text-size-huge" />;
    }

    const countryCode = getCountryCodeByPlaceInfo(currentPlaceInfo);

    return (
      <main className="entry fixed-wrapper fixed-wrapper__main" data-heap-name="site.home.container">
        <DeliverToBar
          data-heap-name="site.home.delivery-bar"
          title={t('DeliverTo')}
          icon={<IconLocation className="icon icon__smaller text-middle flex__shrink-fixed" />}
          className={`entry__deliver-to base-box-shadow ${
            this.state.campaignShown ? 'absolute-wrapper' : 'sticky-wrapper'
          }`}
          content={currentPlaceInfo ? currentPlaceInfo.address : ''}
          gotoLocationPage={this.gotoLocationPage}
          backLeftPosition={this.backLeftPosition}
        >
          <Link to={ROUTER_PATHS.QRSCAN} className="flex flex-middle" data-heap-name="site.home.qr-scan-icon">
            <IconScanner className="icon icon__primary" onClick={this.backLeftPosition} />
          </Link>
        </DeliverToBar>

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
                <IconSearch className="entry-home__search-icon icon icon__small icon__default" />
                <input
                  className="form__input entry-home__input"
                  data-testid="searchStore"
                  data-heap-name="site.home.search-box"
                  type="type"
                  placeholder={t('SearchRestaurantPlaceholder')}
                  onClick={this.handleLoadSearchPage}
                />
              </div>
            </div>
          </Banner>

          {isCampaignActive && countryCode.toUpperCase() === 'MY' && (
            <a
              className="offer-details__bar"
              data-heap-name="site.home.campaign-bar"
              target="_blank"
              href="https://app.beepit.com/download/?utm_source=beep&utm_medium=homepage&utm_campaign=launch_campaign&utm_content=top_banner"
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

          <div className="store-card-list__container padding-normal">
            {currentPlaceInfo.coords ? this.renderStoreList() : null}
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
      currentPlaceId: getCurrentPlaceId(state),
      currentPlaceInfo: getCurrentPlaceInfo(state),
      paginationInfo: getPaginationInfo(state),
      stores: getAllCurrentStores(state),
      storeLinkInfo: getStoreLinkInfo(state),
      storeCollections: getIconCollections(state),
      bannerCollections: getBannerCollections(state),
    }),
    dispatch => ({
      rootActions: bindActionCreators(rootActionCreators, dispatch),
      appActions: bindActionCreators(appActionCreators, dispatch),
      homeActions: bindActionCreators(homeActionCreators, dispatch),
      collectionCardActions: bindActionCreators(collectionCardActionCreators, dispatch),
    })
  )
)(Home);
