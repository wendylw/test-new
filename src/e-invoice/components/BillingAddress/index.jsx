import _isEmpty from 'lodash/isEmpty';
import _clone from 'lodash/clone';
import _omitBy from 'lodash/omitBy';
import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { X, CaretDown } from 'phosphor-react';
import { getClassName } from '../../../common/utils/ui';
import { formRules } from '../../../common/components/Input/utils';
import { COUNTRIES, MALAYSIA_STATES, SEARCH_RADIO_LIST_INPUT_DEFAULT_FOCUS_DELAY } from '../../utils/constants';
import Drawer from '../../../common/components/Drawer';
import DrawerHeader from '../../../common/components/Drawer/DrawerHeader';
import InputText from '../../../common/components/Input/Text';
import SearchRadioList from '../SearchRadioList';
import styles from './BillingAddress.module.scss';

const getCountryUpdatedState = (isMalaysia, currentState, states) => {
  if (!currentState) {
    return {};
  }

  if (!isMalaysia) {
    return { state: MALAYSIA_STATES[currentState] ? '' : currentState };
  }

  const malaysianState = states.find(
    ({ state, name }) => state === currentState || currentState.toLowerCase() === name.toLowerCase()
  );

  return malaysianState || {};
};
const BillingAddress = ({
  isCityRequired,
  isSelectState,
  isInvalidState,
  isInvalidCountry,
  states,
  countries,
  data,
  onChange,
  onValidation,
}) => {
  const { t } = useTranslation(['EInvoice']);
  const [stateDrawerShow, setStateDrawerShow] = useState(false);
  const [countryDrawerShow, setCountryDrawerShow] = useState(false);
  const handleShowStateDrawer = useCallback(() => {
    setStateDrawerShow(true);
  }, []);
  const handleHideStateDrawer = useCallback(() => {
    setStateDrawerShow(false);
  }, []);
  const handleShowCountryDrawer = useCallback(() => {
    setCountryDrawerShow(true);
  }, []);
  const handleHideCountryDrawer = useCallback(() => {
    setCountryDrawerShow(false);
  }, []);
  const handleChangeBillingAddress = useCallback(
    changedFields => {
      const targetBillingAddress = _clone(data);

      changedFields.forEach(({ key, value }) => {
        targetBillingAddress[key] = value;
      });

      onChange(
        _omitBy(
          targetBillingAddress,
          (addressValue, addressKey) =>
            _isEmpty(addressValue) || addressKey === 'stateName' || addressKey === 'countryName'
        )
      );
    },
    [data, onChange]
  );
  const handleChangeStreet1 = useCallback(
    street1 => {
      handleChangeBillingAddress([{ key: 'street1', value: street1 }]);
    },
    [handleChangeBillingAddress]
  );
  const handleChangeStreet2 = useCallback(
    street2 => {
      handleChangeBillingAddress([{ key: 'street2', value: street2 }]);
    },
    [handleChangeBillingAddress]
  );
  const handleChangePostCode = useCallback(
    postCode => {
      handleChangeBillingAddress([{ key: 'postCode', value: postCode }]);
    },
    [handleChangeBillingAddress]
  );
  const handleChangeCity = useCallback(
    city => {
      handleChangeBillingAddress([{ key: 'city', value: city }]);
    },
    [handleChangeBillingAddress]
  );
  const handleChangeState = useCallback(
    state => {
      handleChangeBillingAddress([{ key: 'state', value: state }]);
    },
    [handleChangeBillingAddress]
  );
  const handleSelectedState = useCallback(
    ({ state }) => {
      handleChangeBillingAddress([{ key: 'state', value: state }]);
      handleHideStateDrawer();
    },
    [handleChangeBillingAddress, handleHideStateDrawer]
  );
  const handleSelectedCountry = useCallback(
    ({ countryCode }) => {
      const { state = '' } = getCountryUpdatedState(countryCode === COUNTRIES.MYS.countryCode, data.state, states);

      handleChangeBillingAddress([
        { key: 'state', value: state },
        { key: 'countryCode', value: countryCode },
      ]);
      handleHideCountryDrawer();
    },
    [data.state, states, handleChangeBillingAddress, handleHideCountryDrawer]
  );

  return (
    <section>
      <h3 className={styles.BillingAddressTitle}>{t('BillingAddress')}</h3>
      <InputText
        data-test-id="eInvoice.common.billing-address.street1"
        label={t('AddressLine1FieldTitle')}
        name="street1"
        rules={{ required: true }}
        value={data.street1}
        onChange={handleChangeStreet1}
        onValidation={onValidation}
      />
      <InputText
        data-test-id="eInvoice.common.billing-address.street2"
        label={t('AddressLine2FieldTitle')}
        name="street2"
        value={data.street2}
        onChange={handleChangeStreet2}
        onValidation={onValidation}
      />
      <InputText
        data-test-id="eInvoice.common.billing-address.post-code"
        label={t('PostcodeFieldTitle')}
        name="postCode"
        rules={{ required: true }}
        value={data.postCode}
        onChange={handleChangePostCode}
        onValidation={onValidation}
      />
      <InputText
        data-test-id="eInvoice.common.billing-address.city"
        label={t('CityFieldTitle')}
        name="city"
        rules={{ required: isCityRequired }}
        value={data.city}
        onChange={handleChangeCity}
        onValidation={onValidation}
      />
      {isSelectState ? (
        <div className={styles.BillingAddressFormItemButtonContainer}>
          <div
            role="button"
            tabIndex="0"
            data-test-id="eInvoice.common.billing-address.state.select-button"
            className={getClassName([
              styles.BillingAddressFormItemButton,
              isInvalidState ? styles.BillingAddressFormItemButtonError : null,
            ])}
            onClick={handleShowStateDrawer}
          >
            <div className={styles.BillingAddressFormItemButtonLeft}>
              <div className={styles.BillingAddressFormItemLabel}>
                <span className={styles.BillingAddressFormItemLabelText}>{t('StateFieldTitle')}</span>
                <sup className={styles.BillingAddressFormItemLabelRequired}>*</sup>
              </div>
              <span className={styles.BillingAddressFormItemText}>{data.stateName}</span>
            </div>
            <CaretDown size={24} />
          </div>
          {isInvalidState ? (
            <span className={styles.BillingAddressFormItemErrorMessage}>
              {formRules.required.message(t('StateFieldTitle'))}
            </span>
          ) : null}
          <Drawer
            fullScreen
            className={styles.BillingAddressStateDrawer}
            show={stateDrawerShow}
            header={
              <DrawerHeader
                left={
                  <X
                    weight="light"
                    className={styles.BillingAddressStateDrawerCloseButton}
                    data-test-id="eInvoice.common.billing-address.state.drawer-header-close"
                    onClick={handleHideStateDrawer}
                  />
                }
              >
                <div className={styles.BillingAddressStateDrawerHeaderTitleContainer}>
                  <h3 className={styles.BillingAddressStateDrawerHeaderTitle}>{t('StateFieldTitle')}</h3>
                </div>
              </DrawerHeader>
            }
            onClose={handleHideStateDrawer}
          >
            <SearchRadioList
              data-test-id="eInvoice.common.billing-address.state-list"
              searchInputPlaceholder={t('StateFieldTitle')}
              focusDelay={SEARCH_RADIO_LIST_INPUT_DEFAULT_FOCUS_DELAY}
              name="state"
              options={states}
              onChangeRadioSelected={handleSelectedState}
            />
          </Drawer>
        </div>
      ) : (
        <InputText
          data-test-id="eInvoice.common.billing-address.state"
          label={t('StateFieldTitle')}
          name="state"
          value={data.state}
          onChange={handleChangeState}
          onValidation={onValidation}
        />
      )}

      <div className={styles.BillingAddressFormItemButtonContainer}>
        <div
          role="button"
          tabIndex="0"
          data-test-id="eInvoice.common.billing-address.country.select-button"
          className={getClassName([
            styles.BillingAddressFormItemButton,
            isInvalidCountry ? styles.BillingAddressFormItemButtonError : null,
          ])}
          onClick={handleShowCountryDrawer}
        >
          <div className={styles.BillingAddressFormItemButtonLeft}>
            <div className={styles.BillingAddressFormItemLabel}>
              <span className={styles.BillingAddressFormItemLabelText}>{t('CountryFieldTitle')}</span>
              <sup className={styles.BillingAddressFormItemLabelRequired}>*</sup>
            </div>
            <span className={styles.BillingAddressFormItemText}>{data.countryName}</span>
          </div>
          <CaretDown size={24} />
        </div>
        {isInvalidCountry ? (
          <span className={styles.BillingAddressFormItemErrorMessage}>
            {formRules.required.message(t('CountryFieldTitle'))}
          </span>
        ) : null}
        <Drawer
          fullScreen
          className={styles.BillingAddressCountryDrawer}
          show={countryDrawerShow}
          header={
            <DrawerHeader
              left={
                <X
                  weight="light"
                  className={styles.BillingAddressCountryDrawerCloseButton}
                  data-test-id="eInvoice.common.billing-address.country.drawer-header-close"
                  onClick={handleHideCountryDrawer}
                />
              }
            >
              <div className={styles.BillingAddressCountryDrawerHeaderTitleContainer}>
                <h3 className={styles.BillingAddressCountryDrawerHeaderTitle}>{t('CountryFieldTitle')}</h3>
              </div>
            </DrawerHeader>
          }
          onClose={handleHideCountryDrawer}
        >
          <SearchRadioList
            data-test-id="eInvoice.common.billing-address.country-list"
            searchInputPlaceholder={t('CountryFieldTitle')}
            focusDelay={SEARCH_RADIO_LIST_INPUT_DEFAULT_FOCUS_DELAY}
            name="country"
            options={countries}
            onChangeRadioSelected={handleSelectedCountry}
          />
        </Drawer>
      </div>
    </section>
  );
};

BillingAddress.displayName = 'BillingAddress';

BillingAddress.propTypes = {
  isCityRequired: PropTypes.bool,
  isSelectState: PropTypes.bool,
  isInvalidState: PropTypes.bool,
  isInvalidCountry: PropTypes.bool,
  states: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      state: PropTypes.string,
      name: PropTypes.string,
    })
  ),
  countries: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      countryCode: PropTypes.string,
      name: PropTypes.string,
    })
  ),
  data: PropTypes.shape({
    countryCode: PropTypes.string,
    countryName: PropTypes.string,
    state: PropTypes.string,
    stateName: PropTypes.string,
    city: PropTypes.string,
    postCode: PropTypes.string,
    street1: PropTypes.string,
    street2: PropTypes.string,
  }),
  onChange: PropTypes.func,
  onValidation: PropTypes.func,
};

BillingAddress.defaultProps = {
  isCityRequired: true,
  isSelectState: true,
  isInvalidState: false,
  isInvalidCountry: false,
  states: [],
  countries: [],
  data: {
    countryCode: '',
    countryName: '',
    state: '',
    stateName: '',
    city: '',
    postCode: '',
    street1: '',
    street2: '',
  },
  onChange: () => {},
  onValidation: () => {},
};

export default BillingAddress;
