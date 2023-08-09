import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { withTranslation } from 'react-i18next';
import PromoItem from './PromoItem';
import VoucherEmptyImage from '../../../../../images/beep-voucher-empty.png';
import SearchPromoEmpty from '../../../../../images/beep-search-empty.png';

import {
  actions as promotionActionCreators,
  getVoucherList,
  getFoundPromotion,
  isPromoSearchMode,
  hasSearchedForPromo as userHasSearchedForPromo,
  getSelectedPromo,
} from '../../../../redux/modules/promotion';
import {
  actions as appActionCreators,
  getOnlineStoreInfo,
  getStoreInfoForCleverTap,
  getUserIsLogin,
} from '../../../../redux/modules/app';
import CleverTap from '../../../../../utils/clevertap';

class PromoList extends Component {
  componentDidMount() {
    const { promotionActions, isUserLogin } = this.props;

    if (isUserLogin) {
      promotionActions.fetchConsumerVoucherList();
    }
  }

  componentDidUpdate(prevProps) {
    const { isUserLogin, promotionActions } = this.props;

    if (isUserLogin && isUserLogin !== prevProps.isUserLogin) {
      promotionActions.fetchConsumerVoucherList();
    }
  }

  renderPromoList = (promoList, title) => {
    if (!promoList.length) return;

    const { selectedPromo, onlineStoreInfo, storeInfoForCleverTap } = this.props;

    return (
      <div className="ordering-promotion-list__container padding-top-bottom-smaller margin-top-bottom-smaller">
        <h4 className="text-size-big text-weight-bolder margin-left-right-normal">{title}</h4>
        <ul>
          {promoList.map(promo => (
            <PromoItem
              key={`promotion-${promo.id}`}
              promo={promo}
              isSelected={selectedPromo.id === promo.id}
              onSelectPromo={() => {
                CleverTap.pushEvent('Cart Page - select voucher', storeInfoForCleverTap);
                this.props.promotionActions.selectPromo(promo);
              }}
              onlineStoreInfo={onlineStoreInfo}
            />
          ))}
        </ul>
      </div>
    );
  };

  renderPromoSection = promoList => {
    const { availablePromos, unavailablePromos } = promoList;
    const { t } = this.props;

    return (
      <React.Fragment>
        {this.renderPromoList(availablePromos, t('YourVouchers'))}
        {this.renderPromoList(unavailablePromos, t('InapplicableVouchers'))}
      </React.Fragment>
    );
  };

  renderSearchMode = () => {
    const { hasSearchedForPromo, foundPromo, t } = this.props;

    // On search promo mode
    // Render promo when it's found, render empty image when promo is not found, render nothing when not searched
    if (hasSearchedForPromo) {
      if (foundPromo.quantity) return this.renderPromoSection(foundPromo);

      return (
        <div className="text-center">
          <img className="ordering-promotion-list__empty-image" alt="No promo/voucher found" src={SearchPromoEmpty} />
          <p className="ordering-promotion-list__empty-text">{t('PromoInvalid')}</p>
        </div>
      );
    }

    return null;
  };

  renderNotSearchMode = () => {
    const { foundPromo, voucherList, hasSearchedForPromo, t } = this.props;

    // Not on search mode
    // Render promo when there is a promo found previously
    // Render promo not found when no promo found previously
    // Render voucher list when no search action happened before
    // Render voucher empty image when no voucher found
    if (hasSearchedForPromo) {
      if (foundPromo.quantity) return this.renderPromoSection(foundPromo);

      return (
        <div className="text-center">
          <img className="ordering-promotion-list__empty-image" alt="No promo/voucher found" src={SearchPromoEmpty} />
          <p className="ordering-promotion-list__empty-text">{t('PromoInvalid')}</p>
        </div>
      );
    }

    if (voucherList.quantity) return this.renderPromoSection(voucherList);

    return (
      <div className="text-center">
        <img className="ordering-promotion-list__empty-image" alt="No voucher" src={VoucherEmptyImage} />
        <p className="ordering-promotion-list__empty-text">{t('NoVouchersYet')}</p>
      </div>
    );
  };

  render() {
    const { searchMode } = this.props;

    if (searchMode) return this.renderSearchMode();

    return this.renderNotSearchMode();
  }
}
PromoList.displayName = 'PromoList';

export default compose(
  withTranslation(['OrderingPromotion']),
  connect(
    state => {
      return {
        voucherList: getVoucherList(state),
        foundPromo: getFoundPromotion(state),
        searchMode: isPromoSearchMode(state),
        hasSearchedForPromo: userHasSearchedForPromo(state),
        selectedPromo: getSelectedPromo(state),
        onlineStoreInfo: getOnlineStoreInfo(state),
        storeInfoForCleverTap: getStoreInfoForCleverTap(state),
        isUserLogin: getUserIsLogin(state),
      };
    },
    dispatch => ({
      promotionActions: bindActionCreators(promotionActionCreators, dispatch),
      appActions: bindActionCreators(appActionCreators, dispatch),
    })
  )
)(PromoList);
