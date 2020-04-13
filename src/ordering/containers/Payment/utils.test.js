import { creditCardDetector } from './utils';
import Constants from '../../../utils/constants';

const { PAYMENT_METHOD_LABELS, CREDIT_CARD_BRANDS } = Constants;

describe('utils.creditCardDetector', () => {
  it('creditCardDetector: not digital', () => {
    const card = creditCardDetector('hello');
    expect(card.formattedCardNumber).toBe('');
  });

  it('creditCardDetector: visa', () => {
    const cardNumberString = '4111 1111 1111 1111';
    const card = creditCardDetector(cardNumberString);
    expect(card.formattedCardNumber).toBe(cardNumberString);
    expect(card.brand).toBe(CREDIT_CARD_BRANDS.VISA);
  });

  it('creditCardDetector: mastercard', () => {
    const cardNumberString = '5155 1111 1111 1111';
    const card = creditCardDetector(cardNumberString);
    expect(card.formattedCardNumber).toBe(cardNumberString);
    expect(card.brand).toBe(CREDIT_CARD_BRANDS.MASTER_CARD);
  });

  it('creditCardDetector: JCB', () => {
    const cardNumberString = '3535 8759 9505 0070';
    const card = creditCardDetector(cardNumberString);
    expect(card.formattedCardNumber).toBe(cardNumberString);
    expect(card.brand).toBe(CREDIT_CARD_BRANDS.JCB);
  });
});
