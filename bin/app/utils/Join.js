"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = require("path");
function join(path) {
    var paths = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        paths[_i - 1] = arguments[_i];
    }
    return path_1.join.apply(void 0, [path.toString()].concat(paths));
}
exports.join = join;
//# sourceMappingURL=Join.js.map