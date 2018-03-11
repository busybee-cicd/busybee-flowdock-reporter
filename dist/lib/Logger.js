"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
var validLevels = ['DEBUG', 'INFO', 'WARN', 'ERROR'];
var TAG = 'BUSYBEE-FLOWDOCK';
var Logger = /** @class */ (function () {
    function Logger() {
        this.logLevel = process.env['LOG_LEVEL'] || 'INFO';
        this.logLevel = this.logLevel.toUpperCase();
        this.levelMap = {
            'DEBUG': 0,
            'INFO': 1,
            'WARN': 2,
            'ERROR': 3
        };
    }
    Logger.isLogLevel = function (val) {
        return validLevels.indexOf(val.toUpperCase()) !== -1 ? true : false;
    };
    Logger.prototype.passesLevel = function (level) {
        return this.levelMap[level] >= this.levelMap[this.logLevel];
    };
    Logger.prototype.debug = function (message, pretty) {
        this.write('DEBUG', message, pretty);
    };
    Logger.prototype.info = function (message, pretty) {
        this.write('INFO', message, pretty);
    };
    Logger.prototype.warn = function (message, pretty) {
        this.write('WARN', message, pretty);
    };
    Logger.prototype.error = function (message, pretty) {
        this.write('ERROR', message, pretty);
    };
    Logger.prototype.write = function (level, message, pretty) {
        if (!this.passesLevel(level)) {
            return;
        }
        if (_.isObject(message)) {
            if (pretty) {
                message = JSON.stringify(message, null, '\t');
            }
            else {
                message = JSON.stringify(message);
            }
            if (this.logLevel === 'DEBUG') {
                level = level + ": ";
            }
            console.log(TAG + ":" + level);
            console.log(message);
        }
        else {
            console.log(TAG + ":" + level + ": " + message);
        }
    };
    return Logger;
}());
exports.Logger = Logger;
//# sourceMappingURL=Logger.js.map