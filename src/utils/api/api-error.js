class APIError extends Error {
  constructor(message, { code, status, extra }) {
    super(message || '');

    this.status = status;
    this.code = code;
    this.extra = extra;
  }
}

export default APIError;
