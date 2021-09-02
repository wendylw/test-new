import { getDifferenceInMilliseconds } from '../../../../../utils/datetime-lib';

export function getCompletePhoneNumber(phone) {
  try {
    return `${phone.startsWith('+') ? '' : '+'}${phone}`;
  } catch {
    return phone;
  }
}

/**
 * CleverTap utils
 */
export function getPaidToCurrentEventDurationMinutes(paidTime) {
  try {
    if (!paidTime) {
      return '';
    }

    const milliseconds = getDifferenceInMilliseconds(new Date(), new Date(paidTime));

    const minutes = milliseconds / (1000 * 60);

    return minutes.toFixed(2);
  } catch (error) {
    return '';
  }
}
