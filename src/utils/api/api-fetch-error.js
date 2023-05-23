class ApiFetchError extends Error {
  constructor(message, { category, code, status, extra, error }) {
    super(message || '');
    this.name = category || this.name;

    this.category = category;
    this.status = status;
    this.code = code;
    this.extra = extra;
    this.error = error;
  }
}

export default ApiFetchError;
