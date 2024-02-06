import React, { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useMount } from 'react-use';
import { useTranslation } from 'react-i18next';
import BeepWarningImage from '../../../../../images/beep-warning.svg';
import { PATH_NAME_MAPPING } from '../../../../../common/utils/constants';
import { closeWebView } from '../../../../../utils/native-methods';
import { getIsWebview } from '../../../../redux/modules/common/selectors';
import { getIsUserSessionExpiredResultShow } from './redux/selectors';
import { mounted, backButtonClicked } from './redux/thunks';
import Frame from '../../../../../common/components/Frame';
import PageHeader from '../../../../../common/components/PageHeader';
import ResultContent from '../../../../../common/components/Result/ResultContent';
import CashbackBlock from '../../components/CashbackBlock';
import MerchantInfo from './components/MerchantInfo';
import CashbackDetailFooter from './components/CashbackDetailFooter';
import CashbackStatusPrompt from './components/CashbackStatusPrompt';
import { result } from '../../../../../common/utils/feedback';
import styles from './CashbackDetail.module.scss';

const CashbackDetail = () => {
  const { t } = useTranslation(['Rewards']);
  const dispatch = useDispatch();
  const isWebview = useSelector(getIsWebview);
  const isUserSessionExpiredResultShow = useSelector(getIsUserSessionExpiredResultShow);
  const handleClickHeaderBackButton = useCallback(() => dispatch(backButtonClicked()), [dispatch]);

  useMount(() => {
    dispatch(mounted());
  });

  useEffect(() => {
    if (isUserSessionExpiredResultShow) {
      result(
        <ResultContent
          imageSrc={BeepWarningImage}
          content={t('LoginSessionExpiredDescription')}
          title={t('LoginSessionExpiredTitle')}
        />,
        {
          customizeContent: true,
          onClose: () => {
            if (!isWebview) {
              window.location.href = `${window.location.protocol}//${process.env.REACT_APP_QR_SCAN_DOMAINS}${PATH_NAME_MAPPING.QRSCAN}`;
            } else {
              closeWebView();
            }
          },
        }
      );
    }
  }, [isUserSessionExpiredResultShow, t, isWebview]);

  return (
    <Frame>
      <PageHeader title={t('CashbackDetailPageTitle')} onBackArrowClick={handleClickHeaderBackButton} />
      <MerchantInfo />
      <section className={styles.CashbackDetailCashbackSection}>
        <CashbackBlock />
      </section>
      <CashbackDetailFooter />
      <CashbackStatusPrompt />
    </Frame>
  );
};

CashbackDetail.displayName = 'CashbackDetail';

export default CashbackDetail;
