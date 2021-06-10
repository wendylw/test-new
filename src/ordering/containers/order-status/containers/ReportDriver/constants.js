export const REPORT_DRIVER_REASON_CODE = {
  FOOD_WAS_DAMAGED: 'foodWasDamaged',
  DELIVERY_TAKE_TOO_LONG: 'deliveryTakeTooLong',
  DRIVER_WAS_RUDE: 'driverWasRude',
  DRIVER_ASKED_MORE_MONEY: 'driverAskedMoreMoney',
  ORDER_WAS_MISSING_ITEM: 'orderWasMissingItem',
  NEVER_RECEIVED_MY_ORDER: 'neverReceivedMyOrder',
  OTHERS: 'others',
};

export const REPORT_DRIVER_FIELD_NAMES = {
  NOTES: 'notes',
  PHOTO: 'photo',
};

export const REPORT_DRIVER_REASONS = [
  {
    code: REPORT_DRIVER_REASON_CODE.FOOD_WAS_DAMAGED,
    fields: [
      {
        name: REPORT_DRIVER_FIELD_NAMES.NOTES,
        required: false,
      },
      {
        name: REPORT_DRIVER_FIELD_NAMES.PHOTO,
        required: true,
      },
    ],
    i18n_key: 'FoodWasDamaged',
  },
  {
    code: REPORT_DRIVER_REASON_CODE.DELIVERY_TAKE_TOO_LONG,
    fields: [
      {
        name: REPORT_DRIVER_FIELD_NAMES.NOTES,
        required: true,
      },
    ],
    i18n_key: 'DeliveryTakeTooLong',
  },
  {
    code: REPORT_DRIVER_REASON_CODE.DRIVER_WAS_RUDE,
    fields: [
      {
        name: REPORT_DRIVER_FIELD_NAMES.NOTES,
        required: true,
      },
    ],
    i18n_key: 'DriverWasRude',
  },
  {
    code: REPORT_DRIVER_REASON_CODE.DRIVER_ASKED_MORE_MONEY,
    fields: [
      {
        name: REPORT_DRIVER_FIELD_NAMES.NOTES,
        required: true,
      },
    ],
    i18n_key: 'DriverAskedMoreMoney',
  },
  {
    code: REPORT_DRIVER_REASON_CODE.ORDER_WAS_MISSING_ITEM,
    fields: [
      {
        name: REPORT_DRIVER_FIELD_NAMES.NOTES,
        required: true,
      },
    ],
    i18n_key: 'OrderWasMissingItem',
  },
  {
    code: REPORT_DRIVER_REASON_CODE.NEVER_RECEIVED_MY_ORDER,
    fields: [
      {
        name: REPORT_DRIVER_FIELD_NAMES.NOTES,
        required: true,
      },
    ],
    i18n_key: 'NeverReceivedMyOrder',
  },
  {
    code: REPORT_DRIVER_REASON_CODE.OTHERS,
    fields: [
      {
        name: REPORT_DRIVER_FIELD_NAMES.NOTES,
        required: true,
      },
    ],
    i18n_key: 'Others',
  },
];

export const SUBMIT_STATUS = {
  NOT_SUBMIT: 'NOT_SUBMIT',
  IN_PROGRESS: 'IN_PROGRESS',
  SUBMITTED: 'SUBMITTED',
};
