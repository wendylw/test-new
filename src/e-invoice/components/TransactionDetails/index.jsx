import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { X, CaretDown } from 'phosphor-react';
import { getClassName } from '../../../common/utils/ui';
import { SEARCH_RADIO_LIST_INPUT_DEFAULT_FOCUS_DELAY } from '../../utils/constants';
import { formRules } from '../Input/utils';
import Drawer from '../../../common/components/Drawer';
import DrawerHeader from '../../../common/components/Drawer/DrawerHeader';
import SearchRadioList from '../SearchRadioList';
import styles from './TransactionDetails.module.scss';

const TransactionDetails = ({ isInvalidClassification, data, classifications, onChange }) => {
  const { t } = useTranslation(['EInvoice']);
  const [classificationDrawerShow, setClassificationDrawerShow] = useState(false);
  const handleShowClassificationDrawer = useCallback(() => {
    setClassificationDrawerShow(true);
  }, []);
  const handleHideClassificationDrawer = useCallback(() => {
    setClassificationDrawerShow(false);
  }, []);
  const handleSelectedClassification = useCallback(
    ({ classification: targetClassification }) => {
      onChange(targetClassification);
      handleHideClassificationDrawer();
    },
    [onChange, handleHideClassificationDrawer]
  );

  return (
    <section>
      <h3 className={styles.TransactionDetailsTitle}>{t('TransactionDetails')}</h3>
      <div className={styles.TransactionDetailsFormItemButtonContainer}>
        <div
          role="button"
          tabIndex="0"
          data-test-id="eInvoice.common.billing-address.classification.select-button"
          className={getClassName([
            styles.TransactionDetailsFormItemButton,
            isInvalidClassification ? styles.TransactionDetailsFormItemButtonError : null,
          ])}
          onClick={handleShowClassificationDrawer}
        >
          <div className={styles.TransactionDetailsFormItemButtonLeft}>
            <div className={styles.TransactionDetailsFormItemLabel}>
              <span className={styles.TransactionDetailsFormItemLabelText}>{t('ClassificationFieldTitle')}</span>
              <sup className={styles.TransactionDetailsFormItemLabelRequired}>*</sup>
            </div>
            <span className={styles.TransactionDetailsFormItemText}>{data.name}</span>
          </div>
          <CaretDown size={24} />
        </div>
        {isInvalidClassification ? (
          <span className={styles.TransactionDetailsFormItemErrorMessage}>
            {formRules.required.message(t('ClassificationFieldTitle'))}
          </span>
        ) : null}
        <Drawer
          fullScreen
          className={styles.TransactionDetailsClassificationDrawer}
          show={classificationDrawerShow}
          header={
            <DrawerHeader
              left={
                <X
                  weight="light"
                  className={styles.TransactionDetailsClassificationDrawerCloseButton}
                  data-test-id="eInvoice.common.transaction-details.classification.drawer-header-close"
                  onClick={handleHideClassificationDrawer}
                />
              }
            >
              <div className={styles.TransactionDetailsClassificationDrawerHeaderTitleContainer}>
                <h3 className={styles.TransactionDetailsClassificationDrawerHeaderTitle}>
                  {t('ClassificationFieldTitle')}
                </h3>
              </div>
            </DrawerHeader>
          }
          onClose={handleHideClassificationDrawer}
        >
          <SearchRadioList
            focusDelay={SEARCH_RADIO_LIST_INPUT_DEFAULT_FOCUS_DELAY}
            searchInputPlaceholder={t('ClassificationFieldTitle')}
            name="classification"
            options={classifications}
            onChangeRadioSelected={handleSelectedClassification}
          />
        </Drawer>
      </div>
    </section>
  );
};

TransactionDetails.displayName = 'TransactionDetails';

TransactionDetails.propTypes = {
  isInvalidClassification: PropTypes.bool,
  classifications: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      classificationCode: PropTypes.string,
      name: PropTypes.string,
    })
  ),
  data: PropTypes.shape({
    classification: PropTypes.string,
    name: PropTypes.string,
  }),
  onChange: PropTypes.func,
};

TransactionDetails.defaultProps = {
  isInvalidClassification: false,
  classifications: [],
  data: {},
  onChange: () => {},
};

export default TransactionDetails;
