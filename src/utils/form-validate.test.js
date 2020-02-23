import FormValidate from './form-validate';

describe('utils/form-validate', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('validate: should return {} if no element is found', () => {
    document.body.innerHTML = '';
    const result = FormValidate.validate('my-elem', ['required']);
    expect(result).toEqual({});
  });

  it('validate: should return valid when value is matching required condition', () => {
    document.body.innerHTML = `
      <input id="my-elem" value="hello" />
    `;
    const result = FormValidate.validate('my-elem', {
      rules: { required: { message: 'This field is required' } },
    });
    expect(result).toEqual({
      isValid: true,
      validateKey: 'required',
    });
  });

  it('validate: should return invalid when value is not matching required condition', () => {
    document.body.innerHTML = `
      <input id="my-elem" value="" />
    `;
    const result = FormValidate.validate('my-elem', {
      rules: { required: { message: 'This field is required' } },
    });
    expect(result).toEqual({
      isValid: false,
      validateKey: 'required',
    });
  });

  it('validate: should return valid when value length is matching fixedLength', () => {
    document.body.innerHTML = `
      <input id="my-elem" value="123456" />
    `;
    const result = FormValidate.validate('my-elem', {
      rules: { fixedLength: { length: 6, message: 'length should be 6' } },
    });
    expect(result).toEqual({
      isValid: true,
      validateKey: 'fixedLength',
    });
  });

  it('validate: should return invalid when value length is not matching fixedLength', () => {
    document.body.innerHTML = `
      <input id="my-elem" value="1234567" />
    `;
    const result = FormValidate.validate('my-elem', {
      rules: { fixedLength: { length: 6, message: 'length should be 6' } },
    });
    expect(result).toEqual({
      isValid: false,
      validateKey: 'fixedLength',
    });
  });

  it('validate: should return valid when value is matching customized validator', () => {
    document.body.innerHTML = `
      <input id="my-elem" value="138-0000-0000" />
    `;
    const result = FormValidate.validate('my-elem', {
      rules: { isMobileNumber: { message: 'should be mobile number' } },
      // there's actually some problem on current implementation: customized validator doesn't accept input's value
      isMobileNumber: () => true,
    });
    expect(result).toEqual({
      isValid: true,
      validateKey: 'isMobileNumber',
    });
  });

  it('validate: should return invalid when value is not matching customized validator', () => {
    document.body.innerHTML = `
      <input id="my-elem" value="138-0000-00000" />
    `;
    const result = FormValidate.validate('my-elem', {
      rules: { isMobileNumber: { message: 'should be mobile number' } },
      isMobileNumber: () => false,
    });
    expect(result).toEqual({
      isValid: false,
      validateKey: 'isMobileNumber',
    });
  });

  it('validate: should return valid when value is matching all conditions', () => {
    document.body.innerHTML = `
      <input id="my-elem" value="138-0000-0000" />
    `;
    const result = FormValidate.validate('my-elem', {
      rules: {
        required: { message: 'should not be empty' },
        fixedLength: { message: 'length should be 13', length: 13 },
        isMobileNumber: { message: 'should be mobile number' },
      },
      isMobileNumber: () => true,
    });
    expect(result).toHaveProperty('isValid', true);
  });

  it('validate: should return invalid when value is not matching all conditions', () => {
    document.body.innerHTML = `
      <input id="my-elem" value="1138-0000-0000" />
    `;
    const result = FormValidate.validate('my-elem', {
      rules: {
        required: { message: 'should not be empty' },
        fixedLength: { message: 'length should be 13', length: 13 },
        isMobileNumber: { message: 'should be mobile number' },
      },
      isMobileNumber: () => true,
    });
    expect(result).toEqual({
      isValid: false,
      validateKey: 'fixedLength',
    });
  });

  it('getErrorMessage: should return nothing when value is matching required condition', () => {
    document.body.innerHTML = `
      <input id="my-elem" value="hello" />
    `;
    const result = FormValidate.getErrorMessage('my-elem', {
      rules: { required: { message: 'should not be empty' } },
    });
    expect(result).toBe(null);
  });

  it('getErrorMessage: should return error message when value is not matching required condition', () => {
    document.body.innerHTML = `
      <input id="my-elem" value="" />
    `;
    const result = FormValidate.getErrorMessage('my-elem', {
      rules: { required: { message: 'should not be empty' } },
    });
    expect(result).toBe('should not be empty');
  });

  it('getErrorMessage: should return null when value is matching fixedLength condition', () => {
    document.body.innerHTML = `
      <input id="my-elem" value="123456" />
    `;
    const result = FormValidate.getErrorMessage('my-elem', {
      rules: { fixedLength: { length: 6, message: 'length should be 6' } },
    });
    expect(result).toBe(null);
  });

  it('getErrorMessage: should return error message when value is matching fixedLength condition', () => {
    document.body.innerHTML = `
      <input id="my-elem" value="1234567" />
    `;
    const result = FormValidate.getErrorMessage('my-elem', {
      rules: { fixedLength: { length: 6, message: 'length should be 6' } },
    });
    expect(result).toBe('length should be 6');
  });

  it('getErrorMessage: should return null when value is matching customized validator', () => {
    document.body.innerHTML = `
      <input id="my-elem" value="123456" />
    `;
    const result = FormValidate.getErrorMessage('my-elem', {
      rules: { isMobileNumber: { message: 'should be mobile number' } },
      // there's actually some problem on current implementation: customized validator doesn't accept input's value
      isMobileNumber: () => true,
    });
    expect(result).toBe(null);
  });

  it('getErrorMessage: should return error message when value is not matching customized validator', () => {
    document.body.innerHTML = `
      <input id="my-elem" value="123456" />
    `;
    const result = FormValidate.getErrorMessage('my-elem', {
      rules: { isMobileNumber: { message: 'should be mobile number' } },
      // there's actually some problem on current implementation: customized validator doesn't accept input's value
      isMobileNumber: () => false,
    });
    expect(result).toBe('should be mobile number');
  });

  it('getErrorMessage: should return null when value is matching all conditions', () => {
    document.body.innerHTML = `
      <input id="my-elem" value="138-0000-0000" />
    `;
    const result = FormValidate.getErrorMessage('my-elem', {
      rules: {
        required: { message: 'should not be empty' },
        fixedLength: { message: 'length should be 13', length: 13 },
        isMobileNumber: { message: 'should be mobile number' },
      },
      isMobileNumber: () => true,
    });
    expect(result).toBe(null);
  });

  it('getErrorMessage: should return invalid when value is not matching all conditions', () => {
    document.body.innerHTML = `
      <input id="my-elem" value="1138-0000-0000" />
    `;
    const result = FormValidate.getErrorMessage('my-elem', {
      rules: {
        required: { message: 'should not be empty' },
        fixedLength: { message: 'length should be 13', length: 13 },
        isMobileNumber: { message: 'should be mobile number' },
      },
      isMobileNumber: () => true,
    });
    expect(result).toEqual('length should be 13');
  });
});
