"use strict";
String.prototype.startsWith = function (term) {
    if (!this)
        return false;
    return this.substr(0, term.length) === term;
};
//# sourceMappingURL=string.prototype.js.map