import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { actions } from './redux';
import {
  getShouldShowAlcoholModal,
  isLegalForAlcohol,
  getAlcoholModalVisibility,
  getConfirmNotLegal,
} from './redux/selectors';
import { acceptAlcoholConsent, getUserAlcoholConsent, confirmAlcoholDenied } from './redux/thunks';
import { getMerchantCountry } from '../../../../redux/modules/app';
import Button from '../../../../../common/components/Button';
import Modal from '../../../../../common/components/Modal';
import TermsAndPrivacy from '../../../../../components/TermsAndPrivacy';
import beepAlcoholImage from '../../../../../images/beep-alcohol-consent-new.png';
import styles from './AlcoholModal.module.scss';

const AlcoholModal = ({ history }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation('OrderingHome');
  const shouldModal = useSelector(getShouldShowAlcoholModal);
  const shouldShowAlcoholModal = useSelector(getAlcoholModalVisibility);
  const legalForAlcohol = useSelector(isLegalForAlcohol);
  const country = useSelector(getMerchantCountry);
  const confirmNotLegal = useSelector(getConfirmNotLegal);

  useEffect(() => {
    if (!legalForAlcohol) {
      dispatch(getUserAlcoholConsent());
    }
  }, []);

  useEffect(() => {
    if (shouldModal) {
      dispatch(actions.setAlcoholModalVisibility(true));
    }
  }, [dispatch, shouldModal]);

  const handleClick = value => {
    if (value) {
      dispatch(acceptAlcoholConsent());
      dispatch(actions.setAlcoholModalVisibility(false));
    } else {
      dispatch(actions.setConfirmNotLegal(true));
    }
  };

  return (
    <Modal
      onClose={() => dispatch(actions.setConfirmNotLegal(true))}
      show={shouldShowAlcoholModal}
      className={styles.AlcoholContainer}
      disableBackButtonSupport
    >
      {!confirmNotLegal ? (
        <>
          <div className={styles.AlcoholImage}>
            <img src={beepAlcoholImage} alt="Beep alcohol" />
          </div>
          <h2 className={styles.AlcoholDesTitle}>{t('CheckIfDrinkingAgeDine')}</h2>
          <p className={styles.AlcoholDes}>
            {country === 'MY' && t('AlcoholLimitationsMY')}
            {country === 'PH' && t('AlcoholLimitationsPH')}
          </p>

          <div className={styles.AlcoholButton}>
            <Button
              type="secondary"
              className={styles.AlcoholCloseButton}
              data-testid="noIamNot"
              data-heap-name="ordering.home.confirm.reject"
              onClick={() => handleClick(false)}
            >
              {t('AlcoholNo')}
            </Button>
            <Button
              type="primary"
              className={styles.AlcoholOkButton}
              data-testid="yesIam"
              data-heap-name="ordering.home.confirm.accept"
              onClick={() => handleClick(true)}
            >
              {t('AlcoholYes')}
            </Button>
          </div>
          <p className={styles.AlcoholDesEnd}>
            <TermsAndPrivacy isQROrder />
          </p>
        </>
      ) : (
        <>
          <div className={styles.AlcoholImage}>
            <img src={beepAlcoholImage} alt="Beep alcohol" />
          </div>
          <h2 className={styles.AlcoholDesTitleDenied}>{t('AlcoholDenied')}</h2>
          <p className={styles.AlcoholDesDenied}>{t('AlcoholNotAllowed')}</p>
          <div className={styles.AlcoholButton}>
            <Button
              type="primary"
              className={styles.AlcoholDeniedButton}
              data-heap-name="ordering.home.confirm.got"
              onClick={() => dispatch(confirmAlcoholDenied(history))}
            >
              {t('GotItQr')}
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
};

AlcoholModal.displayName = 'AlcoholModal';

export default withRouter(AlcoholModal);