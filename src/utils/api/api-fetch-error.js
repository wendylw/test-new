class ApiFetchError extends Error {
  constructor(message, { category, code, status, extra }) {
    super(message || '');
    this.name = category || this.name;

    this.category = category;
    this.status = status;
    this.code = code;
    this.extra = extra;
  }
}

export default ApiFetchError;
