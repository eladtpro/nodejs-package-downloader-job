"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var ExtendedError = /** @class */ (function (_super) {
    __extends(ExtendedError, _super);
    function ExtendedError(message, error) {
        var _this = _super.call(this, message) || this;
        Object.assign(_this, error);
        _this.name = _this.constructor.name;
        _this.message = message;
        if (typeof Error.captureStackTrace === 'function')
            Error.captureStackTrace(_this, _this.constructor);
        else
            _this.stack = (new Error(message)).stack;
        _this.original = error;
        var messageLines = (_this.message.match(/\n/g) || []).length + 1;
        _this.stack = _this.stack.split('\n').slice(0, messageLines + 1).join('\n') + '\n' + error.stack;
        return _this;
    }
    return ExtendedError;
}(Error));
//# sourceMappingURL=extended-error.js.map