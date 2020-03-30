import _get from 'lodash/get';
import Constants from '../../../utils/constants';

const PAYMENT_METHOD_LABELS = Constants.PAYMENT_METHOD_LABELS;

const PAYMENT_NAME_MY= {
    [PAYMENT_METHOD_LABELS.ONLINE_BANKING_PAY]: "CCPP",
    [PAYMENT_METHOD_LABELS.CREDIT_CARD_PAY]: "CCPPCreditCard",
    [PAYMENT_METHOD_LABELS.GRAB_PAY]: "GrabPay",
    [PAYMENT_METHOD_LABELS.BOOST_PAY]: "Boost",
};

const PAYMENT_NAME_TH= {
    [PAYMENT_METHOD_LABELS.ONLINE_BANKING_PAY]: "BeepTHOnlineBanking",
    [PAYMENT_METHOD_LABELS.CREDIT_CARD_PAY]: "BeepTHCreditCard",
};

const PAYMENT_NAME_PH= {
    [PAYMENT_METHOD_LABELS.CREDIT_CARD_PAY]: "BeepPHCreditCard",
};

const PAYMENT_NAME_COUNTRY_MAP = {
    MY: PAYMENT_NAME_MY,
    TH: PAYMENT_NAME_TH,
    PH: PAYMENT_NAME_PH,
};

export function getPaymentName(country, paymentLabel) {
    const path = `${country}.${paymentLabel}`;
    return _get(PAYMENT_NAME_COUNTRY_MAP, path, null);
}

const PAYMENT_LIST_COUNTRY_MAP = {
    MY: process.env.REACT_APP_PAYMENT_LIST_MY,
    TH: process.env.REACT_APP_PAYMENT_LIST_TH,
    PH: process.env.REACT_APP_PAYMENT_LIST_PH,
};

export function getPaymentList(country) {
    const paymentList = _get(PAYMENT_LIST_COUNTRY_MAP, country, null);
    
    return paymentList ? paymentList.split(',') : [];
}