"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var request = require("request");
var _ = require("lodash");
var Logger_1 = require("./lib/Logger");
var logger = new Logger_1.Logger();
var flowUrl = 'https://api.flowdock.com/messages';
var DEFAULT_WARNING_THRESHOLD = 85;
var DEFAULT_FAILURE_THRESHOLD = 75;
var REQUIRED = ['token', 'author', 'threadId', 'threadTitle'];
/*
 {
   token: 'd03582ebb05972586c5f183ab5e1edda',
   author: {
     name: 'Sweeney Jenkins',
     avatar: 'https://github.build.ge.com/avatars/u/23999?s=466',
     email: 'Service.SweeneyJenkins@ge.com'
   },
   threadId: 'cr-it-results',
   threadTitle: 'Config Reviewer IT Results',
   resultsUrl: http://whatever.com,
   warningThreshold: 85,
   failureThreshold: 75
 }
 */
var BusybeeFlowdock = /** @class */ (function () {
    function BusybeeFlowdock(conf) {
        this.conf = conf;
        this.warningThreshold = conf.warningThreshold || DEFAULT_WARNING_THRESHOLD;
        this.failureThreshold = conf.failureThreshold || DEFAULT_FAILURE_THRESHOLD;
        var failures = [];
        REQUIRED.forEach(function (key) {
            if (!conf[key]) {
                failures.push(key);
            }
        });
        if (failures.length > 0) {
            if (failures.length === 1) {
                throw new Error("'" + failures[0] + "' is a required configuration key");
            }
            else {
                throw new Error("'" + failures.join(',') + "' are required configuration keys");
            }
        }
    }
    BusybeeFlowdock.prototype.run = function (testSuiteResults) {
        var _this = this;
        var restSuites = _.filter(testSuiteResults, function (ts) { return ts.type === 'REST'; });
        var body = ''; // full Flowdock message body
        var globalCount = 0;
        var globalPass = 0;
        restSuites.forEach(function (testSuite) {
            var count = 0; // total tests in testSuite
            var pass = 0; // total pass for testSuite
            testSuite.testSets.forEach(function (testSet) {
                testSet.tests.forEach(function (t) {
                    count += 1;
                    if (t.pass) {
                        pass += 1;
                    }
                });
            });
            // build summary message for this testSuite
            var score = Math.round(pass / count * 100);
            var color = _this.determineStatusColor(score);
            body += "<span style='color:" + color + ";'>" + testSuite.id + " Complete With " + score + "% Passing</span><br/>";
            globalCount += count;
            globalPass += globalPass;
        });
        // summarize the complete results and create the message title
        var statusValue = 'PASSED';
        var globalScore = Math.round(globalPass / globalCount * 100);
        var statusColor = this.determineStatusColor(globalScore);
        if (statusColor == 'yellow') {
            statusValue = 'UNSTABLE';
        }
        else if (statusColor == 'red') {
            statusValue = 'FAILING';
        }
        var payload = {
            author: this.conf.author,
            flow_token: this.conf.token,
            event: 'activity',
            title: globalPass + "/" + globalCount + " (" + globalScore + "%) Passing",
            body: body,
            external_thread_id: this.conf.threadId,
            thread: {
                title: this.conf.threadTitle,
                status: {
                    color: statusColor,
                    value: statusValue
                }
            }
        };
        if (this.conf.resultsUrl) {
            payload.body = "<a href='" + this.conf.resultsUrl + "'>" + payload.body + "</a>";
        }
        try {
            this.send(payload);
        }
        catch (e) {
            logger.error(e.message);
            throw new Error("Error publishing test results to Flowdock");
        }
    };
    BusybeeFlowdock.prototype.send = function (payload) {
        logger.debug("sending to flowdock");
        logger.debug(payload);
        request.post({ url: flowUrl, body: payload, json: true });
    };
    BusybeeFlowdock.prototype.buildTestPassString = function (suiteName) {
        return this.buildVerdictString(suiteName, 'green');
    };
    BusybeeFlowdock.prototype.buildTestFailString = function (suiteName) {
        return this.buildVerdictString(suiteName, 'red');
    };
    BusybeeFlowdock.prototype.buildVerdictString = function (suiteName, color) {
        return "<span style='color:" + color + ";'>" + suiteName + "<span>";
    };
    BusybeeFlowdock.prototype.determineStatusColor = function (score) {
        var statusColor = 'green';
        if (score < this.warningThreshold) {
            if (score < this.failureThreshold) {
                statusColor = 'red';
            }
            else {
                statusColor = 'yellow';
            }
        }
        return statusColor;
    };
    return BusybeeFlowdock;
}());
exports.BusybeeFlowdock = BusybeeFlowdock;
//# sourceMappingURL=index.js.map