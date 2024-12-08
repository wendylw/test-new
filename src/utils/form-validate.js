const getRequiredError = (value, errorMessage) => {
  if (value || !!value.length) {
    return null;
  }

  return errorMessage;
};

const geIncompleteError = (value, errorMessage, length) => {
  if (value.length === length) {
    return null;
  }

  return errorMessage;
};

const getCustomValidateError = (func, errorMessage) => {
  if (func) {
    return null;
  }

  return errorMessage;
};

const FormValidate = {
  errorNames: {
    required: 'required',
    fixedLength: 'fixedLength',
  },
  getErrorMessageFunctions: {
    required: getRequiredError,
    fixedLength: geIncompleteError,
  },
  getErrorMessage(id, options) {
    const { value } = document.getElementById(id);
    let result = null;

    Object.keys(options.rules).some(item => {
      if (FormValidate.getErrorMessageFunctions[item]) {
        result = FormValidate.getErrorMessageFunctions[item](
          value,
          options.rules[item].message,
          options.rules[item].length
        );
      } else {
        result = getCustomValidateError(options[item](), options.rules[item].message);
      }

      if (result) {
        return true;
      }

      return false;
    });

    return result;
  },
  validate(id, options) {
    if (!document.getElementById(id)) {
      return {};
    }

    const { value } = document.getElementById(id);
    let result = {};

    Object.keys(options.rules).some(item => {
      switch (item) {
        case 'required':
          result = {
            isValid: !!value || !!value.length,
            validateKey: item,
          };
          break;
        case 'fixedLength':
          result = {
            isValid: value.length === options.rules[item].length,
            validateKey: item,
          };
          break;
        default:
          result = {
            isValid: options[item](),
            validateKey: item,
          };
          break;
      }

      if (!result.isValid) {
        return true;
      }

      return false;
    });

    return result;
  },
};

export default FormValidate;
