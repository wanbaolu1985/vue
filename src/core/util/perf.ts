import { inBrowser } from './env'
import { Logger } from 'core/util/loggerImpl2';

export let mark
export let measure
export let plog
export let logger

if (__DEV__) {
  const perf = inBrowser && window.performance
  /* istanbul ignore if */
  if (
    perf &&
    // @ts-ignore
    perf.mark &&
    // @ts-ignore
    perf.measure &&
    // @ts-ignore
    perf.clearMarks &&
    // @ts-ignore
    perf.clearMeasures
  ) {
    mark = tag => perf.mark(tag)
    measure = (name, startTag, endTag) => {
      perf.measure(name, startTag, endTag)
      perf.clearMarks(startTag)
      perf.clearMarks(endTag)
      // perf.clearMeasures(name)
    }
  }

  plog = console.log
  logger = new Logger({ firstTag: 'perf' });
}
