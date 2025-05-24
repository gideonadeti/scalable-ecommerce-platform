import { RmqLoggingInterceptor } from './rmq-logging.interceptor';

describe('RmqLoggingInterceptor', () => {
  it('should be defined', () => {
    expect(new RmqLoggingInterceptor()).toBeDefined();
  });
});
