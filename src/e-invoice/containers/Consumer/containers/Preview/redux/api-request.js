import { post } from '../../../../../../utils/api/api-fetch';
/**
 *
 * @param {Object} {name, myKadIdentificationNo, phone, SSTRegistrationNo(optional), email(optional), classification, billingAddress: {
 *  countryCode,
 *  state(optional),
 *  city(optional),
 *  postCode,
 *  street1
 *  street2(optional)
 * }}
 * @returns {Object} receipt data
 */
export const postOrderDetailForConsumerMalaysianEInvoice = (data, queryParams) =>
  post(`/api/v3/e-invoices`, data, { queryParams });

/**
 *
 * @param {Object} {name, passportNo, taxIdentificationNo(optional), phone, email(optional), classification, billingAddress: {
 *  countryCode,
 *  state(optional),
 *  city(optional),
 *  postCode,
 *  street1
 *  street2(optional)
 * }}
 * @returns {Object} receipt data
 */
export const postOrderDetailForConsumerNonMalaysianEInvoice = (data, queryParams) =>
  post(`/api/v3/e-invoices`, data, { queryParams });
