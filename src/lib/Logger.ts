import * as _ from 'lodash';
const validLevels = ['DEBUG', 'INFO', 'WARN', 'ERROR'];
const TAG = 'BUSYBEE-FLOWDOCK';

export class Logger {

  private logLevel: string;
  private levelMap: any;

  constructor() {
    this.logLevel = process.env['LOG_LEVEL'] || 'INFO';
    this.logLevel = this.logLevel.toUpperCase();
    this.levelMap = {
      'DEBUG': 0,
      'INFO': 1,
      'WARN': 2,
      'ERROR': 3
    }
  }

  static isLogLevel(val:string) {
    return validLevels.indexOf(val.toUpperCase()) !== -1 ? true : false;
  }

  passesLevel(level:string) {
    return this.levelMap[level] >= this.levelMap[this.logLevel];
  }

  debug(message:string|any, pretty?:boolean) {
    this.write('DEBUG', message, pretty);
  }

  info(message:string|any, pretty?:boolean) {
    this.write('INFO', message, pretty);
  }

  warn(message:string|any, pretty?:boolean) {
    this.write('WARN', message, pretty);
  }

  error(message:string|any, pretty?:boolean) {
    this.write('ERROR', message, pretty);
  }

  write(level:string, message:string|any, pretty?:boolean) {
    if (!this.passesLevel(level)) { return; }

    if (_.isObject(message)) {
      if (pretty) {
        message = JSON.stringify(message, null, '\t');
      } else {
        message = JSON.stringify(message);
      }
      if (this.logLevel === 'DEBUG') {
        level = `${level}: `;
      }
      console.log(`${TAG}:${level}`);
      console.log(message);
    } else {
      console.log(`${TAG}:${level}: ${message}`);
    }

  }
}
