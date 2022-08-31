import { API_REQUEST_STATUS } from '../../../../../../common/utils/constants';

export const getCardList = state => state.payments.savedCards.cardList;

export const getSelectedPaymentCard = state => state.payments.savedCards.selectedPaymentCard;

export const getIsRequestSavedCardsPending = state =>
  state.payments.savedCards.loadSavedCardsStatus === API_REQUEST_STATUS.PENDING;
