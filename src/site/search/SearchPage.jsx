import React from 'react';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { debounce } from 'lodash';
import { IconLeftArrow } from '../../components/Icons';
import SearchBox from '../components/SearchBox';
import SwitchPanel from '../components/SwitchPanel';
import StoreListAutoScroll from '../components/StoreListAutoScroll';
import StoreList from '../home/components/StoreList';
import JumpMenu from '../home/components/JumpMenu';
import EmptySearch from './components/EmptySearch';
import MvpNotFoundImage from '../../images/mvp-no-search.svg';
import MvpStartSearchImage from '../../images/mvp-start-search.svg';
import {
  searchActions,
  getStoreList,
  getShippingType,
  getPageInfo,
  getSearchInfo,
  loadedSearchingStores,
} from '../redux/modules/search';
import { submitStoreMenu } from '../home/utils';
import { getStoreLinkInfo, homeActionCreators } from '../redux/modules/home';
import { rootActionCreators } from '../redux/modules';
import { appActionCreators, getCurrentPlaceInfo } from '../redux/modules/app';
import { checkStateRestoreStatus } from '../redux/modules/index';
import withPlaceInfo from '../ordering/containers/Location/withPlaceInfo';
import {
  collectionCardActionCreators,
  getOtherCollections,
  getPopupCollections,
  getStorePageInfo,
} from '../redux/modules/entities/storeCollections';
import constants from '../../utils/constants';

const { COLLECTIONS_TYPE } = constants;

class SearchPage extends React.Component {
  renderId = `${Date.now()}`;
  scrollTop = 0;
  sectionRef = React.createRef();

  componentDidMount = async () => {
    const { otherCollections, popularCollections } = this.props;
    if (!checkStateRestoreStatus()) {
      this.props.searchActions.setShippingType('delivery');
      this.props.searchActions.setSearchInfo({ keyword: '', scrollTop: 0 });
      if (otherCollections.length === 0) {
        this.props.collectionCardActions.getCollections(COLLECTIONS_TYPE.OTHERS);
      }
      if (popularCollections.length === 0) {
        this.props.collectionCardActions.getCollections(COLLECTIONS_TYPE.POPULAR);
      }
    }
  };

  onGoBack = () => {
    this.props.history.push({
      pathname: '/home',
    });
  };

  debounceSearchStores = debounce(() => {
    this.props.searchActions.setPaginationInfo();
    this.props.searchActions.getStoreList();
  }, 700);

  handleSwitchTab = async shippingType => {
    this.props.searchActions.setPaginationInfo();
    this.props.searchActions.setShippingType(shippingType);
    await this.props.searchActions.getStoreList();
  };

  handleSearchTextChange = event => {
    const keyword = event.currentTarget.value;
    this.props.searchActions.setSearchingStoresStatus(false);
    this.props.searchActions.setSearchInfo({ keyword, scrollTop: 0 });
    this.debounceSearchStores();
  };

  handleClearSearchText = () => {
    this.props.searchActions.setSearchInfo({ keyword: '', scrollTop: 0 });
  };

  backupState = () => {
    this.props.rootActions.backup();
  };

  backLeftPosition = async store => {
    const { searchActions, shippingType, currentPlaceInfo } = this.props;
    searchActions.setSearchInfo({ scrollTop: this.scrollTop });
    this.backupState();
    await submitStoreMenu({
      deliveryAddress: currentPlaceInfo,
      store: store,
      source: document.location.href,
      shippingType,
    });
  };

  handleLoadCollections = () => {
    return this.props.collectionCardActions.getCollections(COLLECTIONS_TYPE.OTHERS);
  };

  renderStoreList() {
    const {
      t,
      stores,
      pageInfo,
      storeLinkInfo,
      searchInfo,
      currentPlaceInfo,
      loadedSearchingStores,
      storePageInfo,
      popularCollections,
      otherCollections,
      shippingType,
    } = this.props;
    const { keyword, scrollTop } = searchInfo;

    if (Boolean(keyword) && !loadedSearchingStores) {
      return <div className="entry-home__huge-loader loader theme text-size-huge" />;
    }

    const existCollection =
      (popularCollections && popularCollections.length > 0) || (otherCollections && otherCollections.length > 0);

    return (
      <React.Fragment>
        {(!existCollection || keyword) && (
          <SwitchPanel shippingType={shippingType} handleSwitchTab={this.handleSwitchTab} />
        )}
        {!keyword && existCollection && (
          <div>
            <StoreListAutoScroll
              getScrollParent={() => this.sectionRef.current}
              defaultScrollTop={scrollTop}
              onScroll={scrollTop => (this.scrollTop = scrollTop)}
            >
              <EmptySearch
                populars={popularCollections}
                others={otherCollections}
                hasMore={storePageInfo.hasMore}
                getScrollParent={() => this.sectionRef.current}
                loadCollections={this.handleLoadCollections}
              />
            </StoreListAutoScroll>
          </div>
        )}
        {!keyword && !existCollection && (
          <div className="text-center padding-top-bottom-normal">
            <img className="entry-home__hero-image" src={MvpStartSearchImage} alt="start search store" />
            <p className="entry-home__prompt-text text-size-big text-opacity">{t('StartSearchDescription')}</p>
          </div>
        )}
        {!stores.length && keyword && (
          <div className="text-center padding-top-bottom-normal">
            <img className="entry-home__hero-image" src={MvpNotFoundImage} alt="store not found" />
            <p className="entry-home__prompt-text text-size-big text-opacity">
              {t('SearchNotFoundStoreDescription', { keyword })}
            </p>
          </div>
        )}
        {stores.length && keyword ? (
          <div className="store-card-list__container padding-normal">
            <StoreListAutoScroll
              getScrollParent={() => this.sectionRef.current}
              defaultScrollTop={scrollTop}
              onScroll={scrollTop => (this.scrollTop = scrollTop)}
            >
              <StoreList
                key={`store-list-${this.renderId}`}
                stores={stores}
                hasMore={pageInfo.hasMore}
                getScrollParent={() => this.sectionRef.current}
                loadMoreStores={() => this.props.searchActions.getStoreList()}
                onStoreClicked={store => this.backLeftPosition(store)}
                withInfiniteScroll
              />
            </StoreListAutoScroll>
            <JumpMenu {...storeLinkInfo} deliveryAddress={currentPlaceInfo} />
          </div>
        ) : null}
      </React.Fragment>
    );
  }

  render() {
    const { searchInfo } = this.props;
    const { keyword } = searchInfo;
    return (
      <main className="fixed-wrapper fixed-wrapper__main" data-heap-name="site.search.container">
        <header className="header flex flex-space-between flex-middle sticky-wrapper">
          <div>
            <IconLeftArrow
              className="icon icon__big icon__default text-middle"
              onClick={this.onGoBack}
              data-heap-name="site.search.back-btn"
            />
          </div>
          <SearchBox
            keyword={keyword}
            handleSearchTextChange={this.handleSearchTextChange}
            handleClearSearchText={this.handleClearSearchText}
          />
        </header>
        <section ref={this.sectionRef} className="entry-home fixed-wrapper__container wrapper">
          {this.renderStoreList()}
        </section>
      </main>
    );
  }
}

export default compose(
  withPlaceInfo(),
  withTranslation(),
  connect(
    state => ({
      pageInfo: getPageInfo(state),
      stores: getStoreList(state),
      shippingType: getShippingType(state),
      searchInfo: getSearchInfo(state),
      storeLinkInfo: getStoreLinkInfo(state),
      currentPlaceInfo: getCurrentPlaceInfo(state),
      loadedSearchingStores: loadedSearchingStores(state),
      storePageInfo: getStorePageInfo(state),
      otherCollections: getOtherCollections(state),
      popularCollections: getPopupCollections(state),
    }),
    dispatch => ({
      rootActions: bindActionCreators(rootActionCreators, dispatch),
      appActions: bindActionCreators(appActionCreators, dispatch),
      searchActions: bindActionCreators(searchActions, dispatch),
      homeActions: bindActionCreators(homeActionCreators, dispatch),
      collectionCardActions: bindActionCreators(collectionCardActionCreators, dispatch),
    })
  )
)(SearchPage);
