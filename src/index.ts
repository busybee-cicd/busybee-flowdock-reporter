import * as request from 'request';
import * as _ from 'lodash';
import {Logger} from './lib/Logger';
const logger = new Logger();
const flowUrl = 'https://api.flowdock.com/messages';
const DEFAULT_WARNING_THRESHOLD = 85;
const DEFAULT_FAILURE_THRESHOLD = 75;

const REQUIRED = ['token', 'author', 'threadId', 'threadTitle'];

/*
 {
   token: '<TOKEN>',
   author: {
     name: 'Jenkins',
     avatar: 'https://github.com/avatars/u/23999?s=466',
     email: 'jenkins@email.com'
   },
   threadId: 'api-it-results',
   threadTitle: 'API IT Results',
   resultsUrl: http://my-jenkins.com,
   warningThreshold: 85,
   failureThreshold: 75
 }
 */
export class BusybeeFlowdockReporter {
  private conf: any;
  private warningThreshold: number;
  private failureThreshold: number;
  skipInLocalMode: boolean;

  constructor(conf) {
    this.conf = conf;
    this.skipInLocalMode = conf.skipInLocalMode;
    this.warningThreshold = conf.warningThreshold || DEFAULT_WARNING_THRESHOLD;
    this.failureThreshold = conf.failureThreshold || DEFAULT_FAILURE_THRESHOLD;

    let failures = [];
    REQUIRED.forEach(key => {
      if (!conf[key]) {
        failures.push(key);
      }
    });

    if (failures.length > 0) {
      if (failures.length === 1) {
        throw  new Error(`'${failures[0]}' is a required configuration key`);
      } else {
        throw new Error(`'${failures.join(',')}' are required configuration keys`);
      }
    }
  }

  run(testSuiteResults: any) {
    let restSuites = _.filter(testSuiteResults, ts => { return ts.type === 'REST'; });

    let body = ''; // full Flowdock message body
    let globalCount = 0;
    let globalPass = 0;
    restSuites.forEach(testSuite => {
      let tsCount = 0; // total tests in testSuite
      let tsPass = 0; // total pass for testSuite
      testSuite.testSets.forEach(testSet => {
        testSet.tests.forEach(t => {
          tsCount += 1;
          if (t.pass) {
            tsPass += 1;
          }
        });
      });

      // build summary message for this testSuite
      let tsScore = Math.round(tsPass / tsCount * 100);
      let color = this.determineStatusColor(tsScore);
      body += `<span style='color:${color};'>${testSuite.id} Complete With ${tsScore}% Passing</span><br/>`
      globalCount += tsCount;
      globalPass += tsPass;
    });

    // summarize the complete results and create the message title
    let statusValue = 'PASSED';
    let globalScore = Math.round(globalPass / globalCount * 100);
    let statusColor = this.determineStatusColor(globalScore);
    if (statusColor == 'yellow') {
      statusValue = 'UNSTABLE';
    } else if (statusColor == 'red') {
      statusValue = 'FAILING';
    }

    let payload = {
      author: this.conf.author,
      flow_token: this.conf.token,
      event: 'activity',
      title: `All Suites Complete with ${globalPass}/${globalCount} (${globalScore}%) Passing`,
      body: body,
      external_thread_id: this.conf.threadId,
      thread: {
        title: this.conf.threadTitle,
        status: {
          color: statusColor,
          value: statusValue
        }
      }
    }

    if (this.conf.resultsUrl) {
        payload.body = `<a href='${this.conf.resultsUrl}'>${payload.body}</a>`;
    }

    try {
      this.send(payload);
    } catch (e) {
      logger.error(e.message);
      throw new Error(`Error publishing test results to Flowdock`);
    }

  }

  send(payload) {
    logger.debug(`sending to flowdock`);
    logger.debug(payload);
    request.post({url: flowUrl, body: payload, json: true});
  }

  determineStatusColor(score) {
    let statusColor = 'green';
    if (score < this.warningThreshold) {
        statusColor = 'yellow';
    }
    if (score < this.failureThreshold) {
      statusColor = 'red';
    }

    return statusColor;
  }
}
