import i18next from 'i18next';

export const ERROR_MAPPING = {
  40000: {
    buttonText: 'Common:TryAgain',
  },
  40001: {
    buttonText: 'Common:Continue',
  },
  40002: {
    buttonText: 'Common:Continue',
  },
  40003: {
    buttonText: 'Common:Continue',
  },
  40008: {
    buttonText: 'Common:Continue',
  },
  40009: {
    buttonText: 'Common:Continue',
  },
  40012: {
    buttonText: 'Common:Continue',
  },
  40013: {
    buttonText: 'Common:Continue',
  },
  40015: {
    buttonText: 'Common:Continue',
  },
  40016: {
    buttonText: 'Common:Continue',
  },
  40017: {
    buttonText: 'Common:Continue',
  },
  40018: {
    buttonText: 'Common:Continue',
  },
  40019: {
    buttonText: 'Common:Continue',
  },
  40020: {
    buttonText: 'Common:Continue',
  },
  40022: {
    buttonText: 'Common:Continue',
  },
  40024: {
    buttonText: 'Common:Dismiss',
  },
  40025: {
    buttonText: 'Common:Continue',
    showModal: false,
  },
  40026: {
    buttonText: 'Common:Continue',
    showModal: false,
  },
  41000: {
    buttonText: 'Common:Continue',
  },
  41014: {
    buttonText: 'Common:Reorder',
  },
  57008: {
    buttonText: 'Common:Continue',
  },
  57010: {
    buttonText: 'Common:Continue',
  },
};

export const errorAction = code => {
  const content = i18next.t(`ApiError:${code}Description`);
  const options = {
    title: i18next.t(`ApiError:${code}Title`),
  };

  if (ERROR_MAPPING[code]) {
    options.closeButtonContent = i18next.t(ERROR_MAPPING[code].buttonText);
  }
};
