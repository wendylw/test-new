import logger from '../../utils/monitoring/logger';

class Poller {
  constructor(options) {
    this.fetchData = options.fetchData;
    this.onData = options.onData;
    this.onTimeout = options.onTimeout;
    // timeout and interval are in seconds
    this.timeout = options.timeout || null;
    this.interval = options.interval || 5 * 1000;
    this.clearTimeoutTimerOnStop = options.clearTimeoutTimerOnStop || false;
    this.intervalTimer = null;
    this.timeOutTimer = null;
  }

  start() {
    const fetchData = async () => {
      try {
        if (typeof this.fetchData !== 'function') {
          throw new Error('apiFetch is not a function');
        }

        const result = await this.fetchData();

        this.onData(result);
      } catch (error) {
        this.stop();
        logger.error('Common_Utils_Poller_fetchDataFailed', {
          message: error?.message || '',
        });
      }
    };

    fetchData(); // fetch data immediately

    this.intervalTimer = setInterval(fetchData, this.interval);

    if (this.timeout) {
      this.timeOutTimer = setTimeout(() => {
        this.stop();
        this.onTimeout();
      }, this.timeout);
    }
  }

  stop() {
    if (this.clearTimeoutTimerOnStop) {
      clearTimeout(this.timeOutTimer);
    }

    clearInterval(this.intervalTimer);
  }
}

export default Poller;
