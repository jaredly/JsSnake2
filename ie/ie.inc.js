if (typeof([].splice)=="undefined"){
    Array.prototype.splice = function(at,n){
        return this.slice(0,at).concat(this.slice(at+n));
    }
}
if (typeof([].indexOf)=="undefined"){
    Array.prototype.indexOf = function(what){
        for (var i=0;i<this.length;i++){if (what==this[i])return i;}
        return -1;
    }
}