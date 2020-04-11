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
} from '../redux/modules/home';
import { getPlaceInfo, getPlaceInfoByDeviceByAskPermission } from './utils';
import MvpNotFoundImage from '../../images/mvp-not-found.png';
import MvpDeliveryBannerImage from '../../images/mvp-delivery-banner.png';

const { ROUTER_PATHS /*ADDRESS_RANGE*/ } = Constants;

class Home extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      keyword: '',
      campaignShown: false,
    };

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
      document.body.style = {
        position: 'fixed',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
      };
    }
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

    this.props.homeActions.setSearchingStoresStatus(false);

    this.setState({ keyword }, () => {
      this.debounceSearchStores();
    });
  };

  handleClearSearchText = () => {
    this.setState({ keyword: '' });
  };

  handleLoadMoreStores = () => {
    return this.props.homeActions.getStoreList();
  };

  handleStoreSelected = async store => {
    const { homeActions } = this.props;

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
      paginationInfo: { hasMore },
    } = this.props;

    if (!stores.length) {
      return null;
    }

    return (
      <React.Fragment>
        <h2 className="text-size-biggest text-weight-bold">{t('NearbyRestaurants')}</h2>
        <StoreList
          key={`store-list-${this.renderId}`}
          stores={stores}
          hasMore={hasMore}
          loadMoreStores={this.handleLoadMoreStores}
          onStoreClicked={this.handleStoreSelected}
          getScrollParent={() => this.sectionRef.current}
          withInfiniteScroll
        />
      </React.Fragment>
    );
  };

  renderSearchResult = () => {
    const {
      t,
      searchResult,
      currentPlaceInfo: { coords },
      loadedSearchingStores,
    } = this.props;
    const { keyword } = this.state;

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
        <StoreList
          key={`research-result-${coords.lng}-${coords.lat}`}
          stores={searchResult}
          onStoreClicked={this.handleStoreSelected}
        />
      </React.Fragment>
    );
  };

  render() {
    const { t, currentPlaceInfo, typePicker } = this.props;
    const { keyword } = this.state;

    if (!currentPlaceInfo) {
      return <i className="loader theme full-page text-size-huge"></i>;
    }

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
            paddingBottom: Utils.getUserAgentInfo().browser.includes('Safari') ? '182px' : '66px',
            zIndex: this.state.campaignShown ? 100 : 'auto',
          }}
        >
          <Banner className="entry-home__banner">
            <figure className="entry-home__banner-image">
              <img src={MvpDeliveryBannerImage} alt="mvp home banner logo" />
            </figure>
          </Banner>
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

          <OfferDetails
            onToggle={() => {
              this.setState({ campaignShown: !this.state.campaignShown });
            }}
          />

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
      paginationInfo: getPaginationInfo(state),
      stores: getAllCurrentStores(state),
      searchingStores: getSearchingStores(state),
      searchResult: getSearchResult(state),
      loadedSearchingStores: loadedSearchingStores(state),
      typePicker: getTypePicker(state),
    }),
    dispatch => ({
      appActions: bindActionCreators(appActionCreators, dispatch),
      homeActions: bindActionCreators(homeActionCreators, dispatch),
    })
  )
)(Home);
