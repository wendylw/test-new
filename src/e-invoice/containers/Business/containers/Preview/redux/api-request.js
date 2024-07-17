import { post } from '../../../../../../utils/api/api-fetch';

/**
 *
 * @param {Object} {name, businessRegistrationNo, taxIdentificationNo, SSTRegistrationNo(optional), phone, email(optional), classification, billingAddress: {
 *  countryCode,
 *  state(optional),
 *  city(optional),
 *  postCode,
 *  street1
 *  street2(optional)
 * }}
 * @returns {Object} receipt data
 */
export const postOrderDetailForBusinessEInvoice = (data, queryParams) =>
  post(`/api/v3/e-invoices`, data, { queryParams });
