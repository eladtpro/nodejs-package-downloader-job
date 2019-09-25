String.prototype.startsWith = function (this: string, term: string) {
    if (!this)
        return false;
    return this.substr(0, term.length) === term;
};
