import _isError from 'lodash/isError';
import React from 'react';
import qs from 'qs';
import PropTypes from 'prop-types';
import { withTranslation, Trans } from 'react-i18next';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { Info } from 'phosphor-react';
import Utils from '../../../../../utils/utils';
import { getLocaleTimeTo24hour } from '../../../../../utils/time-lib';
import Constants from '../../../../../utils/constants';
import { PATH_NAME_MAPPING } from '../../../../../common/utils/constants';
import {
  actions as appActions,
  getUserIsLogin,
  getBusinessInfo,
  getShippingType,
  getBusinessUTCOffset,
  getIsWebview,
  getHasLoginGuardPassed,
  getEnableCashback,
  getIsAlipayMiniProgram,
  getIsDynamicUrlExpired,
} from '../../../../redux/modules/app';
import {
  getUniquePromosAvailableCount,
  getIsLoadUniquePromosAvailableCountFulfilled,
  getLoadUniquePromosAvailableCountCleverTap,
} from '../../../../redux/modules/common/selectors';
import { fetchUniquePromosAvailableCount as fetchUniquePromosAvailableCountThunk } from '../../../../redux/modules/common/thunks';
import logger from '../../../../../utils/monitoring/logger';
import prefetch from '../../../../../common/utils/prefetch-assets';
import { actions as cartSubmissionActions } from '../../../../redux/modules/cart';
import {
  queryOrdersAndStatus as queryOrdersAndStatusThunk,
  clearQueryOrdersAndStatus as clearQueryOrdersAndStatusThunk,
  gotoPayment as gotoPaymentThunk,
  reloadBillingByCashback as reloadBillingByCashbackThunk,
  showProcessingLoader as showProcessingLoaderThunk,
  hideProcessingLoader as hideProcessingLoaderThunk,
} from './redux/thunks';
import { actions as commonActionCreators } from '../../redux/common';
import { loadPayLaterOrder as loadOrdersThunk } from '../../redux/thunks';
import {
  removePromo as removePromoThunk,
  removeVoucherPayLater as removeVoucherPayLaterThunk,
} from '../../../Promotion/redux/common/thunks';
import {
  getOrderPickUpCode,
  getOrderTax,
  getOrderServiceCharge,
  getOrderSubtotal,
  getOrderTotal,
  getOrderCashback,
  getOrderShippingFee,
  getIsOrderPlaced,
  getIsOrderPendingPayment,
  getSubOrdersMapping,
  getThankYouPageUrl,
  getOrderServiceChargeRate,
  getOrderBillingPromoIfExist,
  getOrderPromoDiscount,
  getOrderPromotionCode,
  getVoucherBillingIfExist,
  getProductsManualDiscount,
  getOrderVoucherCode,
  getOrderApplyCashback,
  getOrderVoucherDiscount,
  getPromoOrVoucherExist,
  getShouldShowRedirectLoader,
  getShouldShowPayNowButton,
  getShouldShowSwitchButton,
  getShouldDisablePayButton,
  getShouldShowProcessingLoader,
  getIsReloadBillingByCashbackRequestPending,
  getIsReloadBillingByCashbackRequestRejected,
  getCleverTapAttributes,
  getShouldRemoveFooter,
} from './redux/selectors';
import {
  getPayLaterOrderTableId as getTableNumber,
  getPayLaterStoreHash as getStoreHash,
  getPayLaterOrderStatusTableId as getOrderTableId,
  getHasPayLaterOrderTableIdChanged as getHasTableIdChanged,
} from '../../redux/selector';
import CleverTap from '../../../../../utils/clevertap';
import HybridHeader from '../../../../../components/HybridHeader';
import CurrencyNumber from '../../../../components/CurrencyNumber';
import Image from '../../../../../components/Image';
import { IconChecked, IconError, IconClose, IconLocalOffer } from '../../../../../components/Icons';
import Billing from '../../../../components/Billing';
import RedirectPageLoader from '../../../../components/RedirectPageLoader';
import PageProcessingLoader from '../../../../components/PageProcessingLoader';
import { toast, alert } from '../../../../../common/utils/feedback';
import './TableSummary.scss';

const { DELIVERY_METHOD } = Constants;

export class TableSummary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      cartContainerHeight: '100%',
    };
  }

  async componentDidMount() {
    const { t, history, queryOrdersAndStatus, fetchUniquePromosAvailableCount, isLogin } = this.props;
    const receiptNumber = Utils.getQueryString('receiptNumber');
    const emptyString = ['null', 'undefined', ''];

    if (isLogin) {
      fetchUniquePromosAvailableCount();
    }

    window.scrollTo(0, 0);
    this.setCartContainerHeight();

    if (receiptNumber && !emptyString.includes(receiptNumber)) {
      await queryOrdersAndStatus(receiptNumber);
    } else {
      logger.error('Ordering_TableSummary_InitializeFailedByMissingReceiptNumber');

      alert(t('ReceiptNumberInValidDescription'), {
        id: 'ReceiptNumberInValidAlert',
        title: t('ReceiptNumberInValidTitle'),
        closeButtonContent: t('ReturnToCart'),
        onClose: () =>
          history.push({
            pathname: Constants.ROUTER_PATHS.ORDERING_CART,
            search: window.location.search,
          }),
      });
    }
    const { cleverTapAttributes } = this.props;
    // Can record CT only after coreBusiness Loaded. I use one attribute country to trace that.
    if (cleverTapAttributes.country) {
      CleverTap.pushEvent('Table Summary - View Page', cleverTapAttributes);
    }

    prefetch(['ORD_MNU', 'ORD_SC', 'ORD_PROMO', 'ORD_PL'], ['OrderingDelivery', 'OrderingCart', 'OrderingPromotion']);
  }

  componentDidUpdate(prevProps, prevStates) {
    const {
      isLogin: prevIsLogin,
      isLoadUniquePromosAvailableCountFulfilled: prevIsLoadUniquePromosAvailableCountFulfilled,
    } = prevProps;
    const {
      isLogin,
      fetchUniquePromosAvailableCount,
      isLoadUniquePromosAvailableCountFulfilled,
      loadUniquePromosAvailableCountCleverTap,
    } = this.props;

    if (isLogin && !prevIsLogin) {
      fetchUniquePromosAvailableCount();
    }

    this.setCartContainerHeight(prevStates.cartContainerHeight);

    const { hasTableIdChanged: prevHasTableIdChanged, cleverTapAttributes: prevCleverTapAttributes } = prevProps;
    const {
      hasTableIdChanged: currHasTableIdChanged,
      cleverTapAttributes: currCleverTapAttributes,
      thankYouPageUrl,
      shippingType,
      t,
      storeHash,
      orderTableId,
      showProcessingLoader,
    } = this.props;

    // Can record CT only after coreBusiness Loaded. I use one attribute country to trace that.
    if (prevCleverTapAttributes.country !== currCleverTapAttributes.country) {
      CleverTap.pushEvent('Table Summary - View Page', currCleverTapAttributes);
    }

    // Create Clever Tap after unique promo loaded
    if (isLoadUniquePromosAvailableCountFulfilled && !prevIsLoadUniquePromosAvailableCountFulfilled) {
      CleverTap.pushEvent('Table Summary - Promo Indicator', loadUniquePromosAvailableCountCleverTap);
    }

    if (!prevHasTableIdChanged && currHasTableIdChanged) {
      alert(t('TableNumberUpdatedDescription'), {
        id: 'TableNumberUpdatedAlert',
        title: t('TableNumberUpdatedTitle'),
        closeButtonContent: t('GotIt'),
        onClose: async () => {
          await showProcessingLoader();
          window.location.href = `${window.location.origin}${Constants.ROUTER_PATHS.ORDERING_BASE}${
            Constants.ROUTER_PATHS.ORDERING_TABLE_SUMMARY
          }${Utils.getFilteredQueryString(['h', 'table'])}&h=${storeHash}&table=${orderTableId}`;
        },
      });
      return;
    }

    if (thankYouPageUrl) {
      // Add "type" into thankYouPageUrl query
      const urlObj = new URL(thankYouPageUrl, window.location.origin);
      urlObj.searchParams.set('type', shippingType);

      window.location.href = urlObj.toString();
    }
  }

  async componentWillUnmount() {
    const { clearQueryOrdersAndStatus, resetCartSubmission } = this.props;

    await clearQueryOrdersAndStatus();
    resetCartSubmission();
  }

  setCartContainerHeight = preContainerHeight => {
    const containerHeight = Utils.containerHeight({
      headerEls: [this.headerEl],
      footerEls: [this.footerEl],
    });

    if (preContainerHeight !== containerHeight) {
      this.setState({
        cartContainerHeight: containerHeight,
      });
    }
  };

  getCorrectCode(code) {
    const SHOW_LENGTH = 5;
    // show like "Promo..."
    if (code) {
      if (code.length > SHOW_LENGTH) {
        return `${code.substring(0, SHOW_LENGTH)}...`;
      }
      return code;
    }
    return '';
  }

  goToMenuPage = () => {
    const { history, shippingType, cleverTapAttributes } = this.props;
    CleverTap.pushEvent('Table Summary - Add items', cleverTapAttributes);
    const hashCode = Utils.getStoreHashCode();
    const search = qs.stringify(
      {
        h: hashCode,
        type: shippingType,
      },
      { addQueryPrefix: true }
    );

    history.push({
      pathname: Constants.ROUTER_PATHS.ORDERING_HOME,
      search,
    });
  };

  showUnableBackMenuPageAlert = () => {
    const { t, isOrderPendingPayment, isDynamicUrlExpired } = this.props;

    alert(
      <p className="block">
        {isDynamicUrlExpired ? (
          t('UnableBackMenuDynamicUrlExpiredDescription')
        ) : (
          <Trans
            t={t}
            i18nKey={isOrderPendingPayment ? 'UnableBackMenuAndPendingPaymentDescription' : 'UnableBackMenuDescription'}
            components={{ bold: <strong className="text-size-big" /> }}
          />
        )}
      </p>,
      {
        id: 'UnableBackMenuPageAlert',
        title: t('UnableBackMenuTitle'),
        closeButtonContent: t('GotIt'),
      }
    ).then(value => {
      if (_isError(value)) {
        logger.error('Ordering_TableSummary_BackMenuPageFailed');
      }
    });
  };

  handleHeaderNavFunc = () => {
    const { isOrderPlaced, cleverTapAttributes, hasTableIdChanged, isDynamicUrlExpired } = this.props;

    CleverTap.pushEvent('Table Summary - Back', cleverTapAttributes);

    if (hasTableIdChanged) {
      return;
    }

    if (isOrderPlaced && !isDynamicUrlExpired) {
      this.goToMenuPage();

      return;
    }

    this.showUnableBackMenuPageAlert();
  };

  getOrderStatusOptionsEl = () => {
    const { t, isOrderPlaced, isOrderPendingPayment } = this.props;
    let options = null;

    if (isOrderPlaced) {
      options = {
        className: 'table-summary__base-info-status--created',
        icon: <IconChecked className="icon icon__success padding-small" />,
        title: <span className="margin-left-right-smaller text-size-big text-capitalize">{t('OrderPlaced')}</span>,
      };
    } else if (isOrderPendingPayment) {
      options = {
        className: 'table-summary__base-info-status--locked',
        icon: <IconError className="icon icon__primary padding-small" />,
        title: (
          <span className="margin-left-right-smaller text-size-big text-capitalize theme-color">
            {t('PendingPayment')}
          </span>
        ),
      };
    }

    return (
      options && (
        <div className={`${options.className} flex flex-middle padding-small`}>
          {options.icon}
          {options.title}
        </div>
      )
    );
  };

  handleDismissPromotion = async () => {
    const { removePromo, loadOrders, removeVoucherPayLater, orderBillingPromo } = this.props;

    const receiptNumber = Utils.getQueryString('receiptNumber');

    orderBillingPromo ? await removePromo() : await removeVoucherPayLater();

    await loadOrders(receiptNumber);
  };

  handleGotoPromotion = async () => {
    const { history, isLogin, isWebview, loginByBeepApp } = this.props;

    if (isLogin) {
      history.push({
        pathname: Constants.ROUTER_PATHS.ORDERING_PROMOTION,
        search: window.location.search,
        state: { shouldGoBack: true },
      });
      return;
    }

    if (isWebview) {
      // BEEP-2920: In case users can click on the login button in the beep apps, we need to call the native login method.
      await loginByBeepApp();
      return;
    }

    // By default, redirect users to the web login page
    history.push({
      pathname: Constants.ROUTER_PATHS.ORDERING_LOGIN,
      search: window.location.search,
      state: { shouldGoBack: true },
    });
  };

  handleLogin = async () => {
    const {
      history,
      isWebview,
      isAlipayMiniProgram,
      loginByBeepApp,
      loginByAlipayMiniProgram,
      showProcessingLoader,
      hideProcessingLoader,
    } = this.props;

    if (isWebview) {
      await loginByBeepApp();
      return;
    }

    if (isAlipayMiniProgram) {
      await showProcessingLoader();
      await loginByAlipayMiniProgram();
      await hideProcessingLoader();
      return;
    }

    history.push({
      pathname: Constants.ROUTER_PATHS.ORDERING_LOGIN,
      search: window.location.search,
      state: { shouldGoBack: true },
    });
  };

  handleClickPayButton = async () => {
    const receiptNumber = Utils.getQueryString('receiptNumber');
    const removeReceiptNumberUrl = Utils.getFilteredQueryString('receiptNumber');
    const { t, history, gotoPayment, hasLoginGuardPassed, cleverTapAttributes } = this.props;

    if (!receiptNumber) {
      alert(t('SorryDescription'), {
        title: t('SorryEmo'),
        closeButtonContent: t('BackToMenu'),
        onClose: () => {
          history.push({
            pathname: PATH_NAME_MAPPING.ORDERING_HOME,
            search: removeReceiptNumberUrl,
          });
        },
      });

      return;
    }

    CleverTap.pushEvent('Table Summary - Pay now', cleverTapAttributes);

    if (!hasLoginGuardPassed) {
      await this.handleLogin();
      const { isLogin } = this.props;

      if (!isLogin) return;
    }

    await gotoPayment();
  };

  handleToggleCashbackSwitch = async event => {
    const { t, updateCashbackApplyStatus, reloadBillingByCashback } = this.props;
    const nextApplyStatus = event.target.checked;

    // Optimistic update
    updateCashbackApplyStatus(nextApplyStatus);

    await reloadBillingByCashback(nextApplyStatus);

    const { hasUpdateCashbackApplyStatusFailed } = this.props;

    if (hasUpdateCashbackApplyStatusFailed) {
      // Revert cashback apply status to the original one
      updateCashbackApplyStatus(!nextApplyStatus);
      toast(t(`${nextApplyStatus ? 'ApplyCashbackFailedDescription' : 'RemoveCashbackFailedDescription'}`));
    }
  };

  handleClickCashbackInfoButton = () => {
    const { t } = this.props;

    alert(t('CashbackInfoDescription'), {
      title: t('CashbackInfoTitle'),
      closeButtonContent: t('GotIt'),
    });
  };

  handleClickLoginButton = async () => {
    const { history, isWebview, loginByBeepApp } = this.props;

    CleverTap.pushEvent('Login - view login screen', {
      'Screen Name': 'Cart Page',
    });

    if (isWebview) {
      // BEEP-2663: In case users can click on the login button in the beep apps, we need to call the native login method.
      await loginByBeepApp();
      return;
    }

    // By default, redirect users to the web login page
    history.push({
      pathname: Constants.ROUTER_PATHS.ORDERING_LOGIN,
      search: window.location.search,
      state: { shouldGoBack: true },
    });
  };

  handleClickAddItemsButton = () => {
    const { isDynamicUrlExpired } = this.props;

    if (!isDynamicUrlExpired) {
      this.goToMenuPage();

      return;
    }

    this.showUnableBackMenuPageAlert();
  };

  showShortPromoCode() {
    const { orderPromotionCode, orderVoucherCode } = this.props;

    if (orderPromotionCode) {
      return this.getCorrectCode(orderPromotionCode);
    }
    return this.getCorrectCode(orderVoucherCode);
  }

  orderPromoType() {
    const { orderBillingPromo, voucherBilling } = this.props;
    const { PROMO_TYPE } = Constants;

    if (orderBillingPromo) {
      return PROMO_TYPE.PROMOTION_FOR_PAY_LATER;
    }

    if (voucherBilling) {
      return PROMO_TYPE.VOUCHER_FOR_PAY_LATER;
    }

    return '';
  }

  renderDiscount() {
    const { t, productsManualDiscount } = this.props;

    if (productsManualDiscount <= 0) {
      return null;
    }

    return (
      <li className="padding-top-bottom-small padding-left-right-normal flex flex-middle flex-space-between">
        <label className="margin-top-bottom-smaller text-size-big" htmlFor="discount">
          {t('Discount')}
        </label>
        <span>
          - <CurrencyNumber className="text-size-big" money={productsManualDiscount} />
        </span>
      </li>
    );
  }

  renderCashbackItem() {
    const {
      t,
      isLogin,
      cashback,
      isCashbackEnabled,
      isCashbackApplied,
      isOrderPendingPayment,
      shouldShowSwitchButton,
    } = this.props;

    if (!isCashbackEnabled) return null;

    return (
      <li
        className={`padding-top-bottom-small padding-left-right-small border-radius-base flex flex-middle flex-space-between ${
          isLogin ? 'margin-small table-summary__item-primary' : ''
        }`}
      >
        <div className="margin-smaller flex flex-middle flex__shrink-fixed">
          <span className="text-size-big text-weight-bolder">{t('BeepCashback')}</span>
          {cashback > 0 ? (
            <button
              className="flex padding-smaller table-summary__cashback-info-button"
              aria-label="Beep Cashback Info"
              data-test-id="ordering.order-status.table-summary.info-btn"
              onClick={this.handleClickCashbackInfoButton}
            >
              <Info size={16} />
            </button>
          ) : null}
        </div>
        {isOrderPendingPayment || isLogin ? (
          <div className="flex flex-middle">
            {shouldShowSwitchButton ? (
              <label className="table-summary__switch-container margin-left-right-small" htmlFor="cashback-switch">
                <input
                  id="cashback-switch"
                  className="table-summary__toggle-checkbox"
                  data-test-id="ordering.order-status.table-summary.cashback-switch"
                  type="checkbox"
                  checked={isCashbackApplied}
                  onChange={this.handleToggleCashbackSwitch}
                />
                <div className="table-summary__toggle-switch" />
              </label>
            ) : null}
            <span
              className={`margin-smaller table-summary__switch-label__${
                isCashbackApplied || !shouldShowSwitchButton ? 'active' : 'inactive'
              }`}
            >
              - <CurrencyNumber className="text-size-big" money={cashback || 0} />
            </span>
          </div>
        ) : (
          <button
            onClick={this.handleClickLoginButton}
            className="table-summary__button-login button button__fill padding-top-bottom-smaller padding-left-right-normal"
            data-test-id="ordering.table-summary.cashback.login-btn"
          >
            {t('Login')}
          </button>
        )}
      </li>
    );
  }

  renderPromotionItem() {
    const {
      t,
      oderPromoDiscount,
      orderVoucherDiscount,
      promoOrVoucherExist,
      isOrderPlaced,
      uniquePromosAvailableCount,
    } = this.props;

    if (promoOrVoucherExist) {
      return (
        <li className="flex flex-middle flex-space-between border__top-divider border__bottom-divider">
          <div className="table-summary__promotion-content flex flex-middle flex-space-between padding-left-right-small text-weight-bolder text-omit__single-line">
            <IconLocalOffer className="icon icon__small icon__primary text-middle flex__shrink-fixed" />
            <span className="margin-left-right-smaller text-size-big text-weight-bolder text-omit__single-line">
              {t(this.orderPromoType())} ({this.showShortPromoCode()})
            </span>
            <button
              onClick={this.handleDismissPromotion}
              className="button flex__shrink-fixed"
              data-test-id="ordering.table-summary.dismiss-promo"
            >
              <IconClose className="icon icon__small" />
            </button>
          </div>
          <div className="padding-top-bottom-small padding-left-right-normal text-weight-bolder flex__shrink-fixed">
            -{' '}
            <CurrencyNumber
              className="text-size-big text-weight-bolder"
              money={oderPromoDiscount || orderVoucherDiscount}
            />
          </div>
        </li>
      );
    }

    return isOrderPlaced ? (
      <li className="flex flex-middle flex-space-between border__top-divider border__bottom-divider">
        <button
          className="table-summary__button-acquisition button button__block flex flex-middle flex-space-between text-left padding-top-bottom-smaller padding-left-right-normal"
          onClick={this.handleGotoPromotion}
          data-test-id="ordering.table-summary.add-promo"
        >
          <div>
            <IconLocalOffer className="icon icon__small icon__primary text-middle flex__shrink-fixed" />
            <span className="margin-left-right-small text-size-big text-middle">{t('AddPromoCode')}</span>
          </div>
          {uniquePromosAvailableCount > 0 ? (
            <div className="table-summary__rewards-number-text-container">
              <span className="table-summary__rewards-number-text text-size-small text-line-height-base text-weight-bolder padding-top-bottom-smaller">
                {t('UniquePromosCountText', { uniquePromosAvailableCount })}
              </span>
            </div>
          ) : null}
        </button>
      </li>
    ) : null;
  }

  renderSubOrders() {
    const { t, subOrdersMapping, businessUTCOffset } = this.props;
    const subOrderIds = Object.keys(subOrdersMapping);

    return (
      <>
        {subOrderIds.map(subOrderId => {
          const { submittedTime, items: subOrderItems, comments } = subOrdersMapping[subOrderId];
          const localeSubmittedTime = getLocaleTimeTo24hour(submittedTime, businessUTCOffset);

          return (
            <div key={`sub-order-${subOrderId}`} className="table-summary__sub-order padding-top-bottom-small">
              <div className="text-right padding-left-right-small padding-top-bottom-smaller">
                <span className="margin-small text-opacity">
                  {t('CreatedOrderTime', { submittedTime: localeSubmittedTime })}
                </span>
              </div>
              <ul>
                {subOrderItems.map(
                  ({ id, productInfo, displayPrice, quantity, comments: itemComments, isTakeaway }) => {
                    const itemVariants = (productInfo?.variationTexts || []).join(', ');

                    return (
                      <li
                        key={`product-item-${id}`}
                        className="flex flex-middle flex-space-between padding-left-right-small"
                      >
                        <div className="flex">
                          <div className="table-summary__image-container flex__shrink-fixed margin-small">
                            <Image className="table-summary__image card__image" src={productInfo?.image} alt="" />
                          </div>
                          <div className="padding-small flex flex-column flex-space-between">
                            <span className="table-summary__item-title">{productInfo?.title}</span>
                            <div>
                              {itemVariants && (
                                <p className="table-summary__item-variations margin-top-bottom-smaller">
                                  {itemVariants}
                                </p>
                              )}
                              {isTakeaway && (
                                <div className="margin-top-bottom-smaller">
                                  <span className="table-summary__takeaway-variant">{t('TakeAway')}</span>
                                </div>
                              )}
                            </div>
                            <CurrencyNumber
                              className="padding-top-bottom-smaller flex__shrink-fixed text-opacity"
                              money={displayPrice * quantity}
                              numberOnly
                            />
                            {itemComments ? (
                              <p className="table-summary__comments padding-top-bottom-smaller text-size-small text-line-height-higher">
                                {itemComments}
                              </p>
                            ) : null}
                          </div>
                        </div>
                        <span className="padding-top-bottom-small flex__shrink-fixed margin-small text-opacity">
                          x {quantity}
                        </span>
                      </li>
                    );
                  }
                )}
              </ul>

              {comments && (
                <div className="border__top-divider margin-top-bottom-small margin-left-right-normal text-opacity">
                  <p className="padding-top-bottom-normal text-line-height-base">{comments}</p>
                </div>
              )}
            </div>
          );
        })}
      </>
    );
  }

  renderBaseInfo() {
    const { t, orderNumber, tableNumber } = this.props;

    return (
      <div className="table-summary__base-info">
        {this.getOrderStatusOptionsEl()}
        <div className="padding-left-right-normal padding-top-bottom-small">
          <ul className="table-summary__base-info-list">
            {orderNumber ? (
              <li
                key="table-summary-order-number"
                className="flex flex-middle flex-space-between padding-top-bottom-normal"
              >
                <h5 className="text-size-small text-opacity text-capitalize">{t('OrderNumber')}</h5>
                <span className="text-size-small">{orderNumber}</span>
              </li>
            ) : null}
            {tableNumber ? (
              <li
                key="table-summary-table-number"
                className="flex flex-middle flex-space-between padding-top-bottom-normal border__top-divider"
              >
                <h5 className="text-size-small text-opacity text-capitalize">{t('TableNumber')}</h5>
                <span className="text-size-small">{tableNumber}</span>
              </li>
            ) : null}
          </ul>
        </div>
      </div>
    );
  }

  render() {
    const {
      t,
      businessInfo,
      shippingType,
      tax,
      serviceCharge,
      serviceChargeRate,
      subtotal,
      total,
      shippingFee,
      isOrderPlaced,
      shouldShowLoadingText,
      shouldDisablePayButton,
      shouldShowRedirectLoader,
      shouldShowProcessingLoader,
      shouldShowPayNowButton,
      shouldRemoveFooter,
    } = this.props;
    const { cartContainerHeight } = this.state;

    if (shouldShowRedirectLoader) {
      return <RedirectPageLoader />;
    }

    return (
      <section className="table-summary flex flex-column" data-test-id="ordering.order-status.table-summary.container">
        <HybridHeader
          headerRef={ref => {
            this.headerEl = ref;
          }}
          titleAlignment="center"
          className="flex-middle"
          contentClassName="table-summary__header-content flex-middle flex-center flex-space-between text-capitalize"
          data-test-id="ordering.table-summary.header"
          isPage
          title={t('TableSummary')}
          navFunc={this.handleHeaderNavFunc}
        />

        <div
          className="table-summary__container"
          style={{
            top: `${Utils.mainTop({
              headerEls: [this.headerEl],
            })}px`,
            height: cartContainerHeight,
          }}
        >
          {this.renderBaseInfo()}
          {this.renderSubOrders()}
          <Billing
            billingRef={ref => {
              this.billingEl = ref;
            }}
            className="table-summary__billing-container"
            tax={tax}
            serviceCharge={serviceCharge}
            serviceChargeRate={serviceChargeRate}
            subtotal={subtotal}
            total={total}
            shippingFee={shippingFee}
            businessInfo={businessInfo}
            isDeliveryType={shippingType === DELIVERY_METHOD.DELIVERY}
          >
            {this.renderDiscount()}
            {this.renderCashbackItem()}
            {this.renderPromotionItem()}
          </Billing>
        </div>
        {shouldRemoveFooter ? (
          <div className="table-summary__pay-by-cash-only flex flex-center padding-normal">
            <p className="text-uppercase text-bold">{t('AlipayMiniProgramAndPayByCashOnly')}</p>
          </div>
        ) : null}
        {shouldRemoveFooter ? null : (
          <footer
            ref={ref => {
              this.footerEl = ref;
            }}
            className="footer padding-small flex flex-middle"
          >
            {isOrderPlaced ? (
              <button
                className="table-summary__outline-button button button__outline button__block flex__grow-1 padding-normal margin-top-bottom-smaller margin-left-right-small text-uppercase text-weight-bolder"
                data-test-id="ordering.order-status.table-summary.add-btn"
                onClick={this.handleClickAddItemsButton}
              >
                {t('AddItems')}
              </button>
            ) : null}

            <button
              className="button button__fill button__block flex__grow-1 padding-normal margin-top-bottom-smaller margin-left-right-small text-uppercase text-weight-bolder"
              data-testid="pay"
              data-test-id="ordering.order-status.table-summary.pay-btn"
              onClick={this.handleClickPayButton}
              disabled={shouldDisablePayButton}
            >
              {shouldShowPayNowButton ? t('PayNow') : t('SelectPaymentMethod')}
            </button>
          </footer>
        )}
        <PageProcessingLoader
          show={shouldShowProcessingLoader}
          loaderText={shouldShowLoadingText ? t('Loading') : t('Processing')}
        />
      </section>
    );
  }
}

TableSummary.displayName = 'TableSummary';

TableSummary.propTypes = {
  isOrderPlaced: PropTypes.bool,
  isOrderPendingPayment: PropTypes.bool,
  orderNumber: PropTypes.string,
  tableNumber: PropTypes.string,
  tax: PropTypes.number,
  serviceCharge: PropTypes.number,
  serviceChargeRate: PropTypes.number,
  subtotal: PropTypes.number,
  total: PropTypes.number,
  cashback: PropTypes.number,
  shippingFee: PropTypes.number,
  // eslint-disable-next-line react/forbid-prop-types
  subOrdersMapping: PropTypes.object,
  isLogin: PropTypes.bool,
  // eslint-disable-next-line react/forbid-prop-types
  businessInfo: PropTypes.object,
  businessUTCOffset: PropTypes.number,
  shippingType: PropTypes.string,
  queryOrdersAndStatus: PropTypes.func,
  clearQueryOrdersAndStatus: PropTypes.func,
  thankYouPageUrl: PropTypes.string,
  resetCartSubmission: PropTypes.func,
  orderBillingPromo: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  loadOrders: PropTypes.func,
  removePromo: PropTypes.func,
  oderPromoDiscount: PropTypes.number,
  orderPromotionCode: PropTypes.string,
  productsManualDiscount: PropTypes.number,
  removeVoucherPayLater: PropTypes.func,
  voucherBilling: PropTypes.string,
  orderVoucherCode: PropTypes.string,
  orderVoucherDiscount: PropTypes.number,
  promoOrVoucherExist: PropTypes.bool,
  gotoPayment: PropTypes.func,
  // eslint-disable-next-line react/forbid-prop-types
  cleverTapAttributes: PropTypes.object,
  isWebview: PropTypes.bool,
  isAlipayMiniProgram: PropTypes.bool,
  loginByBeepApp: PropTypes.func,
  loginByAlipayMiniProgram: PropTypes.func,
  reloadBillingByCashback: PropTypes.func,
  updateCashbackApplyStatus: PropTypes.func,
  showProcessingLoader: PropTypes.func,
  hideProcessingLoader: PropTypes.func,
  hasLoginGuardPassed: PropTypes.bool,
  shouldShowRedirectLoader: PropTypes.bool,
  shouldShowProcessingLoader: PropTypes.bool,
  shouldShowLoadingText: PropTypes.bool,
  shouldShowPayNowButton: PropTypes.bool,
  shouldRemoveFooter: PropTypes.bool,
  isCashbackEnabled: PropTypes.bool,
  isCashbackApplied: PropTypes.bool,
  shouldShowSwitchButton: PropTypes.bool,
  shouldDisablePayButton: PropTypes.bool,
  hasUpdateCashbackApplyStatusFailed: PropTypes.bool,
  hasTableIdChanged: PropTypes.bool,
  storeHash: PropTypes.string,
  orderTableId: PropTypes.string,
  isDynamicUrlExpired: PropTypes.bool,
  uniquePromosAvailableCount: PropTypes.number,
  isLoadUniquePromosAvailableCountFulfilled: PropTypes.bool,
  // eslint-disable-next-line react/forbid-prop-types
  loadUniquePromosAvailableCountCleverTap: PropTypes.object,
  fetchUniquePromosAvailableCount: PropTypes.func,
};

TableSummary.defaultProps = {
  isOrderPlaced: false,
  isOrderPendingPayment: false,
  orderNumber: null,
  tableNumber: null,
  tax: 0,
  serviceCharge: 0,
  serviceChargeRate: 0,
  subtotal: 0,
  total: 0,
  cashback: 0,
  shippingFee: 0,
  subOrdersMapping: {},
  isLogin: false,
  businessInfo: {},
  businessUTCOffset: 480,
  shippingType: null,
  queryOrdersAndStatus: () => {},
  clearQueryOrdersAndStatus: () => {},
  resetCartSubmission: () => {},
  thankYouPageUrl: '',
  orderBillingPromo: '',
  loadOrders: () => {},
  removePromo: () => {},
  oderPromoDiscount: 0,
  orderPromotionCode: '',
  productsManualDiscount: 0,
  removeVoucherPayLater: () => {},
  voucherBilling: '',
  orderVoucherCode: '',
  orderVoucherDiscount: 0,
  promoOrVoucherExist: false,
  gotoPayment: () => {},
  cleverTapAttributes: {},
  isWebview: false,
  isAlipayMiniProgram: false,
  loginByBeepApp: () => {},
  loginByAlipayMiniProgram: () => {},
  reloadBillingByCashback: () => {},
  updateCashbackApplyStatus: () => {},
  showProcessingLoader: () => {},
  hideProcessingLoader: () => {},
  hasLoginGuardPassed: false,
  shouldShowRedirectLoader: false,
  shouldShowProcessingLoader: false,
  shouldShowLoadingText: false,
  shouldShowPayNowButton: false,
  shouldRemoveFooter: false,
  isCashbackEnabled: false,
  isCashbackApplied: false,
  shouldShowSwitchButton: false,
  shouldDisablePayButton: false,
  hasUpdateCashbackApplyStatusFailed: false,
  hasTableIdChanged: false,
  storeHash: null,
  orderTableId: null,
  isDynamicUrlExpired: false,
  uniquePromosAvailableCount: 0,
  isLoadUniquePromosAvailableCountFulfilled: false,
  loadUniquePromosAvailableCountCleverTap: {},
  fetchUniquePromosAvailableCount: () => {},
};

export default compose(
  withTranslation(['OrderingTableSummary']),
  connect(
    state => ({
      isOrderPlaced: getIsOrderPlaced(state),
      isOrderPendingPayment: getIsOrderPendingPayment(state),
      orderNumber: getOrderPickUpCode(state),
      tableNumber: getTableNumber(state),
      tax: getOrderTax(state),
      thankYouPageUrl: getThankYouPageUrl(state),
      serviceCharge: getOrderServiceCharge(state),
      serviceChargeRate: getOrderServiceChargeRate(state),
      subtotal: getOrderSubtotal(state),
      total: getOrderTotal(state),
      cashback: getOrderCashback(state),
      shippingFee: getOrderShippingFee(state),
      subOrdersMapping: getSubOrdersMapping(state),
      businessUTCOffset: getBusinessUTCOffset(state),
      isLogin: getUserIsLogin(state),
      businessInfo: getBusinessInfo(state),
      shippingType: getShippingType(state),
      orderBillingPromo: getOrderBillingPromoIfExist(state),
      oderPromoDiscount: getOrderPromoDiscount(state),
      orderPromotionCode: getOrderPromotionCode(state),
      productsManualDiscount: getProductsManualDiscount(state),
      voucherBilling: getVoucherBillingIfExist(state),
      orderVoucherCode: getOrderVoucherCode(state),
      orderVoucherDiscount: getOrderVoucherDiscount(state),
      promoOrVoucherExist: getPromoOrVoucherExist(state),
      cleverTapAttributes: getCleverTapAttributes(state),
      isWebview: getIsWebview(state),
      isAlipayMiniProgram: getIsAlipayMiniProgram(state),
      hasLoginGuardPassed: getHasLoginGuardPassed(state),
      shouldShowRedirectLoader: getShouldShowRedirectLoader(state),
      shouldShowPayNowButton: getShouldShowPayNowButton(state),
      shouldRemoveFooter: getShouldRemoveFooter(state),
      isCashbackEnabled: getEnableCashback(state),
      isCashbackApplied: getOrderApplyCashback(state),
      shouldShowSwitchButton: getShouldShowSwitchButton(state),
      shouldShowProcessingLoader: getShouldShowProcessingLoader(state),
      shouldDisablePayButton: getShouldDisablePayButton(state),
      shouldShowLoadingText: getIsReloadBillingByCashbackRequestPending(state),
      hasUpdateCashbackApplyStatusFailed: getIsReloadBillingByCashbackRequestRejected(state),
      hasTableIdChanged: getHasTableIdChanged(state),
      storeHash: getStoreHash(state),
      orderTableId: getOrderTableId(state),
      isDynamicUrlExpired: getIsDynamicUrlExpired(state),
      uniquePromosAvailableCount: getUniquePromosAvailableCount(state),
      isLoadUniquePromosAvailableCountFulfilled: getIsLoadUniquePromosAvailableCountFulfilled(state),
      loadUniquePromosAvailableCountCleverTap: getLoadUniquePromosAvailableCountCleverTap(state),
    }),

    {
      queryOrdersAndStatus: queryOrdersAndStatusThunk,
      clearQueryOrdersAndStatus: clearQueryOrdersAndStatusThunk,
      resetCartSubmission: cartSubmissionActions.resetCartSubmission,
      loadOrders: loadOrdersThunk,
      removePromo: removePromoThunk,
      removeVoucherPayLater: removeVoucherPayLaterThunk,
      gotoPayment: gotoPaymentThunk,
      loginByBeepApp: appActions.loginByBeepApp,
      loginByAlipayMiniProgram: appActions.loginByAlipayMiniProgram,
      reloadBillingByCashback: reloadBillingByCashbackThunk,
      updateCashbackApplyStatus: commonActionCreators.updateCashbackApplyStatus,
      showProcessingLoader: showProcessingLoaderThunk,
      hideProcessingLoader: hideProcessingLoaderThunk,
      fetchUniquePromosAvailableCount: fetchUniquePromosAvailableCountThunk,
    }
  )
)(TableSummary);
