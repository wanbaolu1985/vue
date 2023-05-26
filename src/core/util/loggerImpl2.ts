export interface LogCfg {
  hideTimestamp?: boolean;
  hideLevel?: boolean;
  firstTag?: string;
  secondTag?: string;
  thirdTag?: string;
  prefix?: string;
}

export enum LogLevel {
  silent,
  error,
  warn,
  info,
  debug,
  verbose,
  trace,
}

function logLevelAbbr(level: LogLevel): string {
  switch (level) {
    case LogLevel.silent: return 'S';
    case LogLevel.error: return 'E';
    case LogLevel.warn: return 'W';
    case LogLevel.info: return 'I';
    case LogLevel.debug: return 'D';
    case LogLevel.verbose: return 'V';
    case LogLevel.trace: return 'T';
  }
  return '';
}

if (!console.debug) {
  console.debug = console.log;
}

if (!console.trace) {
  console.trace = console.log;
}

let globalLogLevel: LogLevel = LogLevel.trace;
export function setGlobalLogLevel(level: LogLevel | undefined | null) {
  if (typeof level === 'number') {
    globalLogLevel = level;
  }
}

const urlLogLevel = (() => {
  let level;
  let levelKey;

  const urlKey = 'log';
  const storageKey = 'url_log_level';
  levelKey = new URL(window.location.href).searchParams.get(urlKey);
  // @ts-ignore
  level = LogLevel[levelKey];
  if (typeof level === 'number') {
    window.sessionStorage.setItem(storageKey, `${levelKey}`);
    return level;
  }

  levelKey = window.sessionStorage.getItem(storageKey);
  // @ts-ignore
  level = LogLevel[levelKey];

  return level;
})() as any;

function computeFilterLogLevel(): LogLevel {
  return typeof urlLogLevel === 'number' ? urlLogLevel : globalLogLevel;
}

function allowLog(methodLevel: LogLevel): boolean {
  return methodLevel <= computeFilterLogLevel();
}

export class Logger {
  private readonly cfg: LogCfg;
  constructor(cfg?: LogCfg, logger?: Logger) {
    this.cfg = {
      ...(logger?.cfg || {}),
      ...(cfg || {}),
    };
  }

  get firstTag(): string | undefined {
    return this.cfg.firstTag;
  }

  get secondTag(): string | undefined {
    return this.cfg.secondTag;
  }

  get thirdTag(): string | undefined {
    return this.cfg.thirdTag;
  }

  error(...rest: any[]) {
    if (!allowLog(LogLevel.error)) {
      return;
    }

    console.error(...this.fixArgs(LogLevel.error, rest));
  }

  warn(...rest: any[]) {
    if (!allowLog(LogLevel.warn)) {
      return;
    }

    console.warn(...this.fixArgs(LogLevel.warn, rest));
  }

  info(...rest: any[]) {
    if (!allowLog(LogLevel.info)) {
      return;
    }

    console.info(...this.fixArgs(LogLevel.info, rest));
  }

  debug(...rest: any[]) {
    if (!allowLog(LogLevel.debug)) {
      return;
    }

    // console.debug没有啥效果
    // console.log和console.info其实没差别，在于用的人对于信息重要程度的区别
    console.log(...this.fixArgs(LogLevel.debug, rest));
  }

  verbose(...rest: any[]) {
    if (!allowLog(LogLevel.verbose)) {
      return;
    }

    console.log(...this.fixArgs(LogLevel.verbose, rest));
  }

  trace(...rest: any[]) {
    if (!allowLog(LogLevel.trace)) {
      return;
    }

    console.trace(...this.fixArgs(LogLevel.trace, rest));
  }

  private fixArgs(level: LogLevel, rest: any[]): any[] {
    const totalPrefix = this.computeTotalPrefix(level);
    if (!totalPrefix) {
      return rest;
    }

    const [first, ...other] = rest;
    if (typeof first === 'string') {
      return [totalPrefix + first, ...other];
    }

    return [totalPrefix, ...rest];
  }

  private computeTotalPrefix(level: LogLevel): string {
    const { hideTimestamp, hideLevel, firstTag, secondTag, thirdTag, prefix } = this.cfg;
    let totalPrefix = '';
    if (!hideTimestamp) {
      totalPrefix += `${YYMMDD_HHmmsslll()} `;
    }
    if (!hideLevel) {
      const levelAbbr = logLevelAbbr(level);
      if (levelAbbr) {
        totalPrefix += `${levelAbbr} `;
      }
    }
    if (firstTag) {
      totalPrefix += `<${firstTag}> `;
    }
    if (secondTag) {
      totalPrefix += `(${secondTag}) `;
    }
    if (thirdTag) {
      totalPrefix += `[${thirdTag}] `;
    }
    if (prefix) {
      totalPrefix += `${prefix} `;
    }
    return totalPrefix;
  }
}

function YYMMDD_HHmmsslll(): string {
  const d = new Date();
  return `${d.getFullYear()}/${leadingZero(d.getMonth() + 1, 2)}/${
    leadingZero(d.getDate(), 2)} ${leadingZero(d.getHours(), 2)}:${
    leadingZero(d.getMinutes(), 2)}:${leadingZero(d.getSeconds(), 2)}.${
    leadingZero(d.getMilliseconds(), 3)}`;
}

function leadingZero(n: number, maxLength: number): string {
  let s = n.toString();
  while (s.length < (maxLength || 2)) {
    s = `0${s}`;
  }
  return s;
}

export const gLogger = new Logger();

