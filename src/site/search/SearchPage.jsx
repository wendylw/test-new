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
import MvpNotFoundImage from '../../images/mvp-no-search.svg';
import MvpStartSearchImage from '../../images/mvp-start-search.svg';
import {
  searchActions,
  getStoreList,
  getShippingType,
  getPageInfo,
  getSearchInfo,
  getCoords,
  loadedSearchingStores,
} from '../redux/modules/search';
import { getPlaceInfo, readPlaceInfo, submitStoreMenu } from '../home/utils';
import { getStoreLinkInfo, homeActionCreators } from '../redux/modules/home';
import { rootActionCreators } from '../redux/modules';
import { appActionCreators, getCurrentPlaceInfo } from '../redux/modules/app';
import withPlaceInfo from '../ordering/containers/Location/withPlaceInfo';

class SearchPage extends React.Component {
  static isFirstRender = true;
  renderId = `${Date.now()}`;
  scrollTop = 0;
  sectionRef = React.createRef();
  isRestoreFromStorage = false;

  constructor(props) {
    super(props);
    this.isRestoreFromStorage = props.rootActions.restore();
  }

  componentDidMount = async () => {
    const placeInfoFromStorage = readPlaceInfo();
    this.props.searchActions.setCoords(placeInfoFromStorage.coords);
    if (!(this.isRestoreFromStorage && SearchPage.isFirstRender)) {
      this.props.searchActions.setShippingType('delivery');
      this.props.searchActions.setSearchInfo({ keyword: '', scrollTop: 0 });
    }
    SearchPage.isFirstRender = false;
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

  renderStoreList() {
    const { t, stores, pageInfo, storeLinkInfo, searchInfo, currentPlaceInfo, loadedSearchingStores } = this.props;
    const { keyword, scrollTop } = searchInfo;

    if (Boolean(keyword) && !loadedSearchingStores) {
      return <div className="entry-home__huge-loader loader theme text-size-huge" />;
    }

    return (
      <React.Fragment>
        {!keyword && (
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
        {stores.length && keyword && this.sectionRef.current ? (
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
    const { shippingType, searchInfo } = this.props;
    const { keyword } = searchInfo;
    return (
      <main className="fixed-wrapper fixed-wrapper__main">
        <header className="header flex flex-space-between flex-middle sticky-wrapper">
          <div>
            <IconLeftArrow className="icon icon__big icon__gray text-middle" onClick={this.onGoBack} />
          </div>
          <SearchBox
            keyword={keyword}
            handleSearchTextChange={this.handleSearchTextChange}
            handleClearSearchText={this.handleClearSearchText}
          />
        </header>
        <SwitchPanel shippingType={shippingType} handleSwitchTab={this.handleSwitchTab} />
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
      coords: getCoords(state),
      pageInfo: getPageInfo(state),
      stores: getStoreList(state),
      shippingType: getShippingType(state),
      searchInfo: getSearchInfo(state),
      storeLinkInfo: getStoreLinkInfo(state),
      currentPlaceInfo: getCurrentPlaceInfo(state),
      loadedSearchingStores: loadedSearchingStores(state),
    }),
    dispatch => ({
      rootActions: bindActionCreators(rootActionCreators, dispatch),
      appActions: bindActionCreators(appActionCreators, dispatch),
      searchActions: bindActionCreators(searchActions, dispatch),
      homeActions: bindActionCreators(homeActionCreators, dispatch),
    })
  )
)(SearchPage);
