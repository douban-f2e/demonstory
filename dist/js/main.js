
/* @source ../lib/oz.js */;

/**
 * OzJS: microkernel for modular javascript 
 * compatible with AMD (Asynchronous Module Definition)
 * see http://ozjs.org for details
 *
 * Copyright (C) 2010-2012, Dexter.Yy, MIT License
 * vim: et:ts=4:sw=4:sts=4
 */ 
(function(){

var window = this,
    _toString = Object.prototype.toString,
    _RE_PLUGIN = /(.*)!(.+)/,
    _RE_DEPS = /\Wrequire\((['"]).+?\1\)/g,
    _RE_SUFFIX = /\.(js|json)$/,
    _RE_RELPATH = /^\.+?\/.+/,
    _RE_DOT = /(^|\/)\.\//g,
    _RE_ALIAS_IN_MID = /^([\w\-]+)\//,
    _builtin_mods = { "require": 1, "exports": 1, "module": 1, "host": 1, "finish": 1 },

    _config = {
        mods: {}
    },
    _scripts = {},
    _delays = {},
    _refers = {},
    _waitings = {},
    _latest_mod,
    _scope,
    _resets = {},

    forEach = Array.prototype.forEach || function(fn, sc){
        for(var i = 0, l = this.length; i < l; i++){
            if (i in this)
                fn.call(sc, this[i], i, this);
        }
    };

/**
 * @public define / register a module and its meta information
 * @param {string} module name. optional as unique module in a script file
 * @param {string[]} dependencies 
 * @param {function} module code, execute only once on the first call 
 *
 * @note
 *
 * define('', [""], func)
 * define([""], func)
 * define('', func)
 * define(func)
 *
 * define('', "")
 * define('', [""], "")
 * define('', [""])
 *
 */ 
function define(name, deps, block){
    var is_remote = typeof block === 'string';
    if (!block) {
        if (deps) {
            if (isArray(deps)) {
                block = filesuffix(realname(basename(name)));
            } else {
                block = deps;
                deps = null;
            }
        } else {
            block = name;
            name = "";
        }
        if (typeof name !== 'string') {
            deps = name;
            name = "";
        } else {
            is_remote = typeof block === 'string';
            if (!is_remote && !deps) {
                deps = seek(block);
            }
        }
    }
    name = name && realname(name);
    var mod = name && _config.mods[name];
    if (!_config.debug && mod && mod.name 
            && (is_remote && mod.loaded == 2 || mod.exports)) {
        return;
    }
    if (is_remote && _config.enable_ozma) {
        deps = null;
    }
    var host = isWindow(this) ? this : window;
    mod = _config.mods[name] = {
        name: name,
        url: mod && mod.url,
        host: host,
        deps: deps || []
    };
    if (name === "") { // capture anonymous module
        _latest_mod = mod;
    }
    if (typeof block !== 'string') {
        mod.block = block;
        mod.loaded = 2;
    } else { // remote module
        var alias = _config.aliases;
        if (alias) {
            block = block.replace(/\{(\w+)\}/g, function(e1, e2){
                return alias[e2] || "";
            });
        }
        mod.url = block;
    }
    if (mod.block && !isFunction(mod.block)) { // json module
        mod.exports = block;
    }
}

/**
 * @public run a code block its dependencies 
 * @param {string[]} [module name] dependencies
 * @param {function}
 */ 
function require(deps, block, _self_mod) {
    if (typeof deps === 'string') {
        if (!block) {
            return (_config.mods[realname(basename(deps, _scope))] 
                || {}).exports;
        }
        deps = [deps];
    } else if (!block) {
        block = deps;
        deps = seek(block);
    }
    var host = isWindow(this) ? this : window;
    if (!_self_mod) {
        _self_mod = { url: _scope && _scope.url };
    }
    var m, remotes = 0, // counter for remote scripts
        list = scan.call(host, deps, _self_mod);  // calculate dependencies, find all required modules
    for (var i = 0, l = list.length; i < l; i++) {
        m = list[i];
        if (m.is_reset) {
            m = _config.mods[m.name];
        }
        if (m.url && m.loaded !== 2) { // remote module
            remotes++;
            m.loaded = 1; // status: loading
            fetch(m, function(){
                this.loaded = 2; // status: loaded 
                var lm = _latest_mod;
                if (lm) { // capture anonymous module
                    lm.name = this.name;
                    lm.url = this.url;
                    _config.mods[this.name] = lm;
                    _latest_mod = null;
                }
                // loaded all modules, calculate dependencies all over again
                if (--remotes <= 0) {
                    require.call(host, deps, block, _self_mod);
                }
            });
        }
    }
    if (!remotes) {
        _self_mod.deps = deps;
        _self_mod.host = host;
        _self_mod.block = block;
        setTimeout(function(){
            tidy(deps, _self_mod);
            list.push(_self_mod);
            exec(list.reverse());
        }, 0);
    }
}

/**
 * @private execute modules in a sequence of dependency
 * @param {object[]} [module object]
 */ 
function exec(list){
    var mod, mid, tid, result, isAsync, deps,
        depObjs, exportObj, moduleObj, rmod,
        wt = _waitings;
    while (mod = list.pop()) {
        if (mod.is_reset) {
            rmod = clone(_config.mods[mod.name]);
            rmod.host = mod.host;
            rmod.newname = mod.newname;
            mod = rmod;
            if (!_resets[mod.newname]) {
                _resets[mod.newname] = [];
            }
            _resets[mod.newname].push(mod);
            mod.exports = undefined;
        } else if (mod.name) {
            mod = _config.mods[mod.name] || mod;
        }
        if (!mod.block || !mod.running && mod.exports !== undefined) {
            continue;
        }
        depObjs = [];
        exportObj = {}; // for "exports" module
        moduleObj = { id: mod.name, filename: mod.url, exports: exportObj };
        deps = mod.deps.slice();
        deps[mod.block.hiddenDeps ? 'unshift' : 'push']("require", "exports", "module");
        for (var i = 0, l = deps.length; i < l; i++) {
            mid = deps[i];
            switch(mid) {
                case 'require':
                    depObjs.push(require);
                    break;
                case 'exports':
                    depObjs.push(exportObj);
                    break;
                case 'module':
                    depObjs.push(moduleObj);
                    break;
                case 'host': // deprecated
                    depObjs.push(mod.host);
                    break;
                case 'finish':  // execute asynchronously
                    tid = mod.name;
                    if (!wt[tid]) // for delay execute
                        wt[tid] = [list];
                    else
                        wt[tid].push(list);
                    depObjs.push(function(result){
                        // HACK: no guarantee that this function will be invoked after while() loop termination in Chrome/Safari 
                        setTimeout(function(){
                            // 'mod' equal to 'list[list.length-1]'
                            if (result !== undefined) {
                                mod.exports = result;
                            }
                            if (!wt[tid])
                                return;
                            forEach.call(wt[tid], function(list){
                                this(list);
                            }, exec);
                            delete wt[tid];
                            mod.running = 0;
                        }, 0);
                    });
                    isAsync = 1;
                    break;
                default:
                    depObjs.push((
                        (_resets[mid] || []).pop() 
                        || _config.mods[realname(mid)] 
                        || {}
                    ).exports);
                    break;
            }
        }
        if (!mod.running) {
            // execute module code. arguments: [dep1, dep2, ..., require, exports, module]
            _scope = mod;
            result = mod.block.apply(mod.host, depObjs) || null;
            _scope = false;
            exportObj = moduleObj.exports;
            mod.exports = result !== undefined ? result : exportObj; // use empty exportObj for "finish"
            for (var v in exportObj) {
                if (v) {
                    mod.exports = exportObj;
                }
                break;
            }
        }
        if (isAsync) { // skip, wait for finish() 
            mod.running = 1;
            break;
        }
    }
}

/**
 * @private observer for script loader, prevent duplicate requests
 * @param {object} module object
 * @param {function} callback
 */ 
function fetch(m, cb){
    var url = m.url,
        observers = _scripts[url];
    if (!observers) {
        var mname = m.name, delays = _delays;
        if (m.deps && m.deps.length && delays[mname] !== 1) {
            delays[mname] = [m.deps.length, cb];
            m.deps.forEach(function(dep){
                var d = _config.mods[realname(dep)];
                if (this[dep] !== 1 && d.url && d.loaded !== 2) {
                    if (!this[dep]) {
                        this[dep] = [];
                    }
                    this[dep].push(m);
                } else {
                    delays[mname][0]--;
                }
            }, _refers);
            if (delays[mname][0] > 0) {
                return;
            } else {
                delays[mname] = 1;
            }
        }
        observers = _scripts[url] = [[cb, m]];
        var true_url = /^\w+:\/\//.test(url) ? url 
            : (_config.enable_ozma && _config.distUrl || _config.baseUrl || '') 
                + (_config.enableAutoSuffix ? namesuffix(url) : url);
        getScript.call(m.host || this, true_url, function(){
            forEach.call(observers, function(args){
                args[0].call(args[1]);
            });
            _scripts[url] = 1;
            if (_refers[mname] && _refers[mname] !== 1) {
                _refers[mname].forEach(function(dm){
                    var b = this[dm.name];
                    if (--b[0] <= 0) {
                        this[dm.name] = 1;
                        fetch(dm, b[1]);
                    }
                }, delays);
                _refers[mname] = 1;
            }
        });
    } else if (observers === 1) {
        cb.call(m);
    } else {
        observers.push([cb, m]);
    }
}

/**
 * @private search and sequence all dependencies, based on DFS
 * @param {string[]} a set of module names
 * @param {object[]} 
 * @param {object[]} a sequence of modules, for recursion
 * @return {object[]} a sequence of modules
 */ 
function scan(m, file_mod, list){
    list = list || [];
    if (!m[0]) {
        return list;
    }
    var deps,
        history = list.history;
    if (!history) {
        history = list.history = {};
    }
    if (m[1]) {
        deps = m;
        m = false;
    } else {
        var truename,
            _mid = m[0],
            plugin = _RE_PLUGIN.exec(_mid);
        if (plugin) {
            _mid = plugin[2];
            plugin = plugin[1];
        }
        var mid = realname(_mid);
        if (!_config.mods[mid] && !_builtin_mods[mid]) {
            var true_mid = realname(basename(_mid, file_mod));
            if (mid !== true_mid) {
                _config.mods[file_mod.url + ':' + mid] = true_mid;
                mid = true_mid;
            }
            if (!_config.mods[true_mid]) {
                define(true_mid, filesuffix(true_mid));
            }
        }
        m = file_mod = _config.mods[mid];
        if (m) {
            if (plugin === "new") {
                m = {
                    is_reset: true,
                    deps: m.deps,
                    name: mid,
                    newname: plugin + "!" + mid,
                    host: this
                };
            } else {
                truename = m.name;
            }
            if (history[truename]) {
                return list;
            }
        } else {
            return list;
        }
        if (!history[truename]) {
            deps = m.deps || [];
            // find require information within the code
            // for server-side style module
            //deps = deps.concat(seek(m));
            if (truename) {
                history[truename] = true;
            }
        } else {
            deps = [];
        }
    }
    for (var i = deps.length - 1; i >= 0; i--) {
        if (!history[deps[i]]) {
            scan.call(this, [deps[i]], file_mod, list);
        }
    }
    if (m) {
        tidy(deps, m);
        list.push(m);
    }
    return list;
}

/**
 * @experiment 
 * @private analyse module code 
 *          to find out dependencies which have no explicit declaration
 * @param {object} module object
 */ 
function seek(block){
    var hdeps = block.hiddenDeps || [];
    if (!block.hiddenDeps) {
        var code = block.toString(),
            h = null;
        hdeps = block.hiddenDeps = [];
        while (h = _RE_DEPS.exec(code)) {
            hdeps.push(h[0].slice(10, -2));
        }
    }
    return hdeps.slice();
}

function tidy(deps, m){
    forEach.call(deps.slice(), function(dep, i){
        var true_mid = this[m.url + ':' + realname(dep)];
        if (typeof true_mid === 'string') {
            deps[i] = true_mid;
        }
    }, _config.mods);
}

function config(opt){
    for (var i in opt) {
        if (i === 'aliases') {
            if (!_config[i]) {
                _config[i] = {};
            }
            for (var j in opt[i]) {
                _config[i][j] = opt[i][j];
            }
            var mods = _config.mods;
            for (var k in mods) {
                mods[k].name = realname(k);
                mods[mods[k].name] = mods[k];
            }
        } else {
            _config[i] = opt[i];
        }
    }
}

/**
 * @note naming pattern:
 * _g_src.js 
 * _g_combo.js 
 *
 * jquery.js 
 * jquery_pack.js
 * 
 * _yy_src.pack.js 
 * _yy_combo.js
 * 
 * _yy_bak.pack.js 
 * _yy_bak.pack_pack.js
 */
function namesuffix(file){
    return file.replace(/(.+?)(_src.*)?(\.\w+)$/, function($0, $1, $2, $3){
        return $1 + ($2 && '_combo' || '_pack') + $3;
    });
}

function filesuffix(mid){
    return _RE_SUFFIX.test(mid) ? mid : mid + '.js';
}

function realname(mid){
    var alias = _config.aliases;
    if (alias) {
        mid = mid.replace(_RE_ALIAS_IN_MID, function(e1, e2){
            return alias[e2] || (e2 + '/');
        });
    }
    return mid;
}

function basename(mid, file_mod){
    var rel_path = _RE_RELPATH.exec(mid);
    if (rel_path && file_mod) { // resolve relative path in Module ID
        mid = (file_mod.url || '').replace(/[^\/]+$/, '') + rel_path[0];
    }
    return resolvename(mid);
}

function resolvename(url){
    url = url.replace(_RE_DOT, '$1');
    var dots, dots_n, url_dup = url, RE_DOTS = /(\.\.\/)+/g;
    while (dots = (RE_DOTS.exec(url_dup) || [])[0]) {
        dots_n = dots.match(/\.\.\//g).length;
        url = url.replace(new RegExp('([^/\\.]+/){' + dots_n + '}' + dots), '');
    }
    return url.replace(/\/\//g, '/');
}

/**
 * @public non-blocking script loader
 * @param {string}
 * @param {object} config
 */ 
function getScript(url, op){
    var doc = isWindow(this) ? this.document : document,
        s = doc.createElement("script");
    s.type = "text/javascript";
    s.async = "async"; //for firefox3.6
    if (!op)
        op = {};
    else if (isFunction(op))
        op = { callback: op };
    if (op.charset)
        s.charset = op.charset;
    s.src = url;
    var h = doc.getElementsByTagName("head")[0];
    s.onload = s.onreadystatechange = function(__, isAbort){
        if ( isAbort || !s.readyState || /loaded|complete/.test(s.readyState) ) {
            s.onload = s.onreadystatechange = null;
            if (h && s.parentNode) {
                h.removeChild(s);
            }
            s = undefined;
            if (!isAbort && op.callback) {
                op.callback();
            }
        }
    };
    h.insertBefore(s, h.firstChild);
}

function isFunction(obj) {
    return _toString.call(obj) === "[object Function]";
}

function isArray(obj) {
    return _toString.call(obj) === "[object Array]";
}

function isWindow(obj) {
    return "setInterval" in obj;
}

function clone(obj) { // be careful of using `delete`
    function NewObj(){}
    NewObj.prototype = obj;
    return new NewObj();
}

var oz = {
    VERSION: '2.5.1',
    define: define,
    require: require,
    config: config,
    seek: seek,
    fetch: fetch,
    realname: realname,
    basename: basename,
    filesuffix: filesuffix,
    namesuffix: namesuffix,
    // non-core
    _getScript: getScript,
    _clone: clone,
    _forEach: forEach,
    _isFunction: isFunction,
    _isWindow: isWindow
};

require.config = config;
define.amd = { jQuery: true };

if (!window.window) { // for nodejs
    exports.oz = oz;
    exports._config = _config;
     // hook for build tool
    for (var i in oz) {
        exports[i] = oz[i];
    }
    var hooking = function(fname){
        return function(){ return exports[fname].apply(this, arguments); };
    };
    exec = hooking('exec');
    fetch = hooking('fetch');
    require = hooking('require');
    require.config = config;
} else {
    window.oz = oz;
    window.define = define;
    window.require = require;
}

})();

require.config({ enable_ozma: true });


/* @source mo/domready.js */;

/**
 * Non-plugin implementation of cross-browser DOM ready event
 * Based on OzJS's built-in module -- 'finish'
 *
 * using AMD (Asynchronous Module Definition) API with OzJS
 * see http://ozjs.org for details
 *
 * Copyright (C) 2010-2012, Dexter.Yy, MIT License
 * vim: et:ts=4:sw=4:sts=4
 */
define("mo/domready", [
  "finish"
], function(finish){
    var loaded, 
        w = this, 
        doc = w.document, 
        ADD = "addEventListener",
        IEADD = "attachEvent",
        READY = "DOMContentLoaded", 
        CHANGE = "onreadystatechange";

    if (doc.readyState === "complete") {
        setTimeout(finish, 1);
    } else {
        if (doc[ADD]){
            loaded = function(){
                doc.removeEventListener("READY", loaded, false);
                finish();
            };
            doc[ADD](READY, loaded, false);
            w[ADD]("load", finish, false);
        } else if (doc[IEADD]) {
            loaded = function(){
                if (doc.readyState === "complete") {
                    doc.detachEvent(CHANGE, loaded);
                    finish();
                }
            };
            doc[IEADD](CHANGE, loaded);
            w[IEADD]("load", finish);
            var toplevel = false;
            try {
                toplevel = w.frameElement == null;
            } catch(e) {}

            if (doc.documentElement.doScroll && toplevel) {
                var check = function(){
                    try {
                        doc.documentElement.doScroll("left");
                    } catch(e) {
                        setTimeout(check, 1);
                        return;
                    }
                    finish();
                };
                check();
            }
        }
    }
});

/* @source mo/lang/es5.js */;

/**
 * using AMD (Asynchronous Module Definition) API with OzJS
 * see http://ozjs.org for details
 *
 * Copyright (C) 2010-2012, Dexter.Yy, MIT License
 * vim: et:ts=4:sw=4:sts=4
 */
define("mo/lang/es5", [], function(){

    var host = this,
        Array = host.Array,
        String = host.String,
        Object = host.Object,
        Function = host.Function,
        window = host.window,
        _toString = Object.prototype.toString,
        _aproto = Array.prototype;

    if (!_aproto.filter) {
        _aproto.filter = function(fn, sc){
            var r = [];
            for (var i = 0, l = this.length; i < l; i++){
                if (i in this && fn.call(sc, this[i], i, this)) {
                    r.push(this[i]);
                }
            }
            return r;
        };
    }
        
    if (!_aproto.forEach) {
        _aproto.forEach = function(fn, sc){
            for(var i = 0, l = this.length; i < l; i++){
                if (i in this)
                    fn.call(sc, this[i], i, this);
            }
        };
    }

    if (!_aproto.map) {
        _aproto.map = function(fn, sc){
            for (var i = 0, copy = [], l = this.length; i < l; i++) {
                if (i in this) {
                    copy[i] = fn.call(sc, this[i], i, this);
                }
            }
            return copy;
        };
    }

    if (!_aproto.reduce) {
        _aproto.reduce = function(fn, sc){
            for (var i = 1, prev = this[0], l = this.length; i < l; i++) {
                if (i in this) {
                    prev = fn.call(sc, prev, this[i], i, this);
                }
            }
            return prev;
        };
    }

    if (!_aproto.some) {
        _aproto.some = function(fn, sc){
            for (var i = 0, l = this.length; i < l; i++){
                if (i in this && fn.call(sc, this[i], i, this)) {
                    return true;
                }
            }
            return false;
        };
    }

    if (!_aproto.every) {
        _aproto.every = function(fn, sc){
            for (var i = 0, l = this.length; i < l; i++){
                if (i in this && !fn.call(sc, this[i], i, this)) {
                    return false;
                }
            }
            return true;
        };
    }

    if (!_aproto.indexOf) {
        _aproto.indexOf = function(elt, from){
            var l = this.length;
            from = parseInt(from, 10) || 0;
            if (from < 0)
                from += l;
            for (; from < l; from++) {
                if (from in this && this[from] === elt)
                    return from;
            }
            return -1;
        };
    }

    if (!_aproto.lastIndexOf) {
        _aproto.lastIndexOf = function(elt, from){
            var l = this.length;
            from = parseInt(from, 10) || l - 1;
            if (from < 0)
                from += l;
            for (; from > -1; from--) {
                if (from in this && this[from] === elt)
                    return from;
            }
            return -1;
        };
    }

    if (!Array.isArray) {
        Array.isArray = function(obj) {
            return _toString.call(obj) === "[object Array]";
        };
    }

    var rnotwhite = /\S/,
        trimLeft = /^\s+/,
        trimRight = /\s+$/;
    if (rnotwhite.test( "\xA0")) {
        trimLeft = /^[\s\xA0]+/;
        trimRight = /[\s\xA0]+$/;
    }
    if (!String.prototype.trim) {
        String.prototype.trim = function(text) {
            return text == null ?  "" : text.toString().replace(trimLeft, "").replace(trimRight, "");
        };
    }

    if (!Object.keys) {
        Object.keys = function(obj) {
            var keys = [];
            for (var prop in obj) {
                if ( obj.hasOwnProperty(prop) ) {
                    keys.push(prop);
                }
            }
            return keys;
        };
    }

    if (!Object.create) {
        Object.create = function(obj) {
            function NewObj(){}
            NewObj.prototype = obj;
            return new NewObj();
        };
    }

    if (!Object.getPrototypeOf) {
        Object.getPrototypeOf = function (obj) {
            return obj.__proto__ || obj.constructor.prototype;
        };
    }
    

    if (!Function.prototype.bind) {
        Function.prototype.bind = function (oThis) {
            var aArgs = _aproto.slice.call(arguments, 1), 
                fToBind = this, 
                fBound = function () {
                    return fToBind.apply(this instanceof fBound ? this : oThis || window, 
                        aArgs.concat(_aproto.slice.call(arguments)));    
                };
            fBound.prototype = Object.create(this.prototype);
            return fBound;
        };
    }

});

/* @source mo/lang/type.js */;

/**
 * using AMD (Asynchronous Module Definition) API with OzJS
 * see http://ozjs.org for details
 *
 * Copyright (C) 2010-2012, Dexter.Yy, MIT License
 * vim: et:ts=4:sw=4:sts=4
 */
define("mo/lang/type", [
  "mo/lang/es5"
], function(_0, require, exports){

    var _toString = Object.prototype.toString,
        _aproto = Array.prototype,
        _typeMap = {};

    _aproto.forEach.call("Boolean Number String Function Array Date RegExp Object".split(" "), function(name , i){
        this[ "[object " + name + "]" ] = name.toLowerCase();
    }, _typeMap);

    function type(obj) {
        return obj == null ?
            String(obj) :
            _typeMap[ _toString.call(obj) ] || "object";
    }

    exports.type = type;

    exports.isFunction = function(obj) {
        return _toString.call(obj) === "[object Function]";
    };

    exports.isWindow = function(obj) {
        return "setInterval" in obj;
    };

	exports.isEmptyObject = function(obj) {
        for (var name in obj) {
            return false;
        }
        return true;
	};

});

/* @source mo/lang/mix.js */;

/**
 * using AMD (Asynchronous Module Definition) API with OzJS
 * see http://ozjs.org for details
 *
 * Copyright (C) 2010-2012, Dexter.Yy, MIT License
 * vim: et:ts=4:sw=4:sts=4
 */
define("mo/lang/mix", [
  "mo/lang/es5",
  "mo/lang/type"
], function(_0, _, require, exports){

    var type = _.type;

    function mix(origin) {
        var objs = arguments, ol = objs.length, 
            VALTYPE = { 'number': 1, 'boolean': 2, 'string': 3 },
            obj, lvl, i, l;
        if (typeof objs[ol - 1] !== 'object') {
            lvl = objs[ol - 1] || 0;
            ol--;
        } else {
            lvl = 0;
        }
        for (var n = 1; n < ol; n++) {
            obj = objs[n];
            if (Array.isArray(obj)) {
                origin = !VALTYPE[typeof origin] && origin || [];
                l = obj.length;
                for (i = 0; i < l; i++) {
                    if (lvl >= 1 && obj[i] && typeof obj[i] === 'object') {
                        origin[i] = mix(origin[i], obj[i], lvl - 1);
                    } else {
                        origin[i] = obj[i];
                    }
                }
            } else {
                origin = !VALTYPE[typeof origin] && origin || {};
                for (i in obj) {
                    if (lvl >= 1 && obj[i] && typeof obj[i] === 'object') {
                        origin[i] = mix(origin[i], obj[i], lvl - 1);
                    } else {
                        origin[i] = obj[i];
                    }
                }
            }
        }
        return origin;
    }

    function merge(origin) {
        var objs = arguments, ol = objs.length, 
            ITERTYPE = { 'object': 1, 'array': 2 },
            obj, lvl, i, k, lib, marked, mark;
        if (typeof objs[ol - 1] !== 'object') {
            lvl = objs[ol - 1] || 0;
            ol--;
        } else {
            lvl = 0;
        }
        for (var n = 1; n < ol; n++) {
            obj = objs[n];
            if (Array.isArray(origin)) {
                origin = origin || [];
                lib = {};
                marked = [];
                mark = '__oz_uniqmark_' + (+new Date() + Math.random());
                obj = obj.concat(origin);
                origin.length = 0;
                obj.forEach(function(i){
                    if (i && typeof i === 'object') {
                        if (!i[mark]) {
                            if (lvl >= 1 && Array.isArray(i)) {
                                origin.push(merge(i, [], lvl - 1));
                            } else {
                                origin.push(i);
                            }
                            i[mark] = 1;
                            marked.push(i);
                        }
                    } else {
                        k = (typeof i) + '_' + i;
                        if (!this[k]) {
                            origin.push(i);
                            this[k] = 1;
                        }
                    }
                }, lib);
                marked.forEach(function(i){
                    delete i[mark];
                });
            } else {
                origin = origin || {};
                for (i in obj) {
                    if (!origin.hasOwnProperty(i)) {
                        origin[i] = obj[i];
                    } else if (lvl >= 1 && i 
                            // avoid undefined === undefined
                            && ITERTYPE[type(origin[i])] + 0 === ITERTYPE[type(obj[i])] + 0) {
                        origin[i] = merge(origin[i], obj[i], lvl - 1);
                    }
                }
            }
        }
        return origin;
    }

    function interset(origin) {
        var objs = arguments, ol = objs.length, 
            ITERTYPE = { 'object': 1, 'array': 2 },
            obj, lvl, i, k, lib, marked, mark;
        if (typeof objs[ol - 1] !== 'object') {
            lvl = objs[ol - 1] || 0;
            ol--;
        } else {
            lvl = 0;
        }
        for (var n = 1; n < ol; n++) {
            obj = objs[n];
            if (Array.isArray(origin)) {
                origin = origin || [];
                lib = {};
                marked = [];
                mark = '__oz_uniqmark_' + (+new Date() + Math.random());
                origin.forEach(function(i){
                    if (i && typeof i === 'object' && !i[mark]) {
                        i[mark] = 1;
                        marked.push(i);
                    } else {
                        k = (typeof i) + '_' + i;
                        this[k] = 1;
                    }
                }, lib);
                origin.length = 0;
                obj.forEach(function(i){
                    if (i && typeof i === 'object') {
                        if (i[mark] === 1) {
                            origin.push(i);
                            i[mark] = 2;
                        }
                    } else {
                        k = (typeof i) + '_' + i;
                        if (this[k] === 1) {
                            origin.push(i);
                            this[k] = 2;
                        }
                    }
                }, lib);
                marked.forEach(function(i){
                    delete i[mark];
                });
            } else {
                origin = origin || {};
                for (i in origin) {
                    if (!obj.hasOwnProperty(i)) {
                        delete origin[i];
                    } else if (lvl >= 1 && i 
                            && ITERTYPE[type(origin[i])] + 0 === ITERTYPE[type(obj[i])] + 0) {
                        origin[i] = interset(origin[i], obj[i], lvl - 1);
                    }
                }
            }
        }
        return origin;
    }

    exports.mix = mix;
    exports.merge = merge;
    exports.interset = interset;

    exports.copy = function(obj, lvl) {
        return mix(null, obj, lvl);
    };

    exports.occupy = function(origin, obj, lvl) {
        return mix(interset(origin, obj, lvl), obj, lvl);
    };

    exports.defaults = merge;

    exports.config = function(cfg, opt, default_cfg, lvl){
        return mix(merge(cfg, default_cfg, lvl), interset(mix(null, opt, lvl), default_cfg, lvl), lvl);
    };

    exports.unique = function(origin, lvl) {
        return merge(origin, [], lvl);
    };

});


/* @source mo/lang/oop.js */;

/**
 * using AMD (Asynchronous Module Definition) API with OzJS
 * see http://ozjs.org for details
 *
 * Copyright (C) 2010-2012, Dexter.Yy, MIT License
 * vim: et:ts=4:sw=4:sts=4
 */
define("mo/lang/oop", [
  "mo/lang/es5",
  "mo/lang/mix"
], function(es5, _, require, exports){

    var mix = _.mix;

    function _apply(base, self, args){
        return base.apply(self, args);
    }

    exports.construct = function(base, mixes, factory){
        if (mixes && !Array.isArray(mixes)) {
            factory = mixes;
        }
        if (!factory) {
            factory = function(){
                this.superConstructor.apply(this, arguments);
            };
        }
        var proto = Object.create(base.prototype),
            supr = Object.create(base.prototype),
            constructor = function(){
                var self = this;
                this.constructor = constructor;
                this.superConstructor = function(){
                    _apply.prototype = base.prototype;
                    var su = new _apply(base, self, arguments);
                    for (var i in su) {
                        if (!self[i]) {
                            self[i] = supr[i] = su[i];
                        }
                    }
                };
                this.superClass = supr;
                return factory.apply(this, arguments);
            };
        constructor.prototype = proto;
        if (mixes) {
            mixes = mix.apply(this, mixes);
            mix(proto, mixes);
            mix(supr, mixes);
        }
        return constructor;
    };

});

/* @source mo/lang/struct.js */;

/**
 * using AMD (Asynchronous Module Definition) API with OzJS
 * see http://ozjs.org for details
 *
 * Copyright (C) 2010-2012, Dexter.Yy, MIT License
 * vim: et:ts=4:sw=4:sts=4
 */
define("mo/lang/struct", [
  "mo/lang/es5",
  "mo/lang/mix"
], function(_0, _, require, exports){

    var mix = _.mix;

    exports.index = function(list, key) {
        var obj = {}, item;
        for (var i = 0, l = list.length; i < l; i++) {
            item = list[i];
            if (key && typeof item === 'object') {
                obj[item[key]] = item;
            } else {
                obj[item] = true;
            }
        }
        return obj;
    };

    exports.fnQueue = function(){
        var queue = [], dup = false;
        function getCallMethod(type){
            return function(){
                var re, fn;
                dup = this.slice().reverse();
                while (fn = dup.pop()) {
                    re = fn[type].apply(fn, arguments);
                }
                dup = false;
                return re;
            };
        }
        mix(queue, {
            call: getCallMethod('call'),
            apply: getCallMethod('apply'),
            clear: function(func){
                if (!func) {
                    this.length = 0;
                } else {
                    var size = this.length,
                        popsize = size - dup.length;
                    for (var i = this.length - 1; i >= 0; i--) {
                        if (this[i] === func) {
                            this.splice(i, 1);
                            if (dup && i >= popsize)
                                dup.splice(size - i - 1, 1);
                        }
                    }
                    if (i < 0)
                        return false;
                }
                return true;
            }
        });
        return queue;
    };

});


/* @source mo/lang.js */;

/**
 * ES5/6 shim and minimum utilities for language enhancement
 *
 * using AMD (Asynchronous Module Definition) API with OzJS
 * see http://ozjs.org for details
 *
 * Copyright (C) 2010-2012, Dexter.Yy, MIT License
 * vim: et:ts=4:sw=4:sts=4
 */
define("mo/lang", [
  "mo/lang/es5",
  "mo/lang/type",
  "mo/lang/mix",
  "mo/lang/struct",
  "mo/lang/oop"
], function(es5, detect, _, struct, oo, require, exports){

    var host = this,
        window = host.window;

    _.mix(exports, detect, _, struct, oo);

    exports.ns = function(namespace, v, parent){
        var i, p = parent || window, n = namespace.split(".").reverse();
        while ((i = n.pop()) && n.length > 0) {
            if (typeof p[i] === 'undefined') {
                p[i] = {};
            } else if (typeof p[i] !== "object") {
                return false;
            }
            p = p[i];
        }
        if (typeof v !== 'undefined')
            p[i] = v;
        return p[i];
    };

});

/* @source dollar.js */;

/**
 * DollarJS
 * A jQuery-compatible and non-All-in-One library which is more "Zepto" than Zepto.js
 * Focus on DOM operations and mobile platform, wrap native API wherever possible.
 *
 * using AMD (Asynchronous Module Definition) API with OzJS
 * see http://ozjs.org for details
 *
 * Copyright (C) 2010-2012, Dexter.Yy, MIT License
 * vim: et:ts=4:sw=4:sts=4
 */
define("dollar", [
  "mo/lang/es5",
  "mo/lang/mix",
  "mo/lang/type"
], function(es5, _, detect){

    var window = this,
        doc = window.document,
        NEXT_SIB = 'nextElementSibling',
        PREV_SIB = 'prevElementSibling',
        FIRST_CHILD = 'firstElementChild',
        MATCHES_SELECTOR = ['webkitMatchesSelector', 'mozMatchesSelector', 'matchesSelector']
            .map(function(name){
                return this[name] && name;
            }, doc.body).filter(pick)[0],
        _MOE = 'MouseEvents',
        SPECIAL_EVENTS = { click: _MOE, mousedown: _MOE, mouseup: _MOE, mousemove: _MOE },
        CSS_NUMBER = { 
            'column-count': 1, 'columns': 1, 'font-weight': 1, 
            'line-height': 1, 'opacity': 1, 'z-index': 1, 'zoom': 1 
        },
        RE_HTMLTAG = /^\s*<(\w+|!)[^>]*>/,
        isFunction = detect.isFunction,
        _array_each = Array.prototype.forEach,
        _array_map = Array.prototype.map,
        _array_push = Array.prototype.push,
        _getComputedStyle = document.defaultView.getComputedStyle,
        _next_pointer,
        _elm_display = {},
        _html_containers = {};


    function $(selector, context){
        if (selector) {
            if (selector.constructor === $) {
                return selector;
            } else if (typeof selector !== 'string') {
                var nodes = new $();
                _array_push[selector.push === _array_push 
                    ? 'apply' : 'call'](nodes, selector);
                return nodes;
            } else {
                selector = selector.trim();
                if (RE_HTMLTAG.test(selector)) {
                    return create_nodes(selector);
                } else if (context) {
                    return $(context).find(selector);
                } else {
                    return ext.find(selector);
                }
            }
        } else if (this === window) {
            return new $();
        }
    }

    var ext = $.fn = $.prototype = [];

    ['map', 'filter', 'slice', 'reverse', 'sort'].forEach(function(method){
        var origin = this['_' + method] = this[method];
        this[method] = function(){
            return $(origin.apply(this, arguments));
        };
    }, ext);

    ['splice', 'concat'].forEach(function(method){
        var origin = this['_' + method] = this[method];
        this[method] = function(){
            return $(origin.apply(this._slice(), _array_map.call(
                arguments, function(i){
                    return i._slice();
                })
            ));
        };
    }, ext);

    _.mix(ext, {

        constructor: $,

        // Traversing

        find: function(selector){
            var nodes = new $(), contexts;
            if (this === ext) {
                contexts = [doc];
            } else {
                nodes.prevObject = contexts = this;
            }
            if (/^#[\w_]+$/.test(selector)) {
                var elm = (contexts[0] || doc).getElementById(selector.substr(1));
                if (elm) {
                    nodes.push(elm);
                }
            } else {
                var query = /\W/.test(selector) ? 'querySelectorAll' 
                                                : 'getElementsByTagName';
                if (contexts[1]) {
                    contexts.forEach(function(context){
                        this.push.apply(this, context[query](selector));
                    }, nodes);
                } else if (contexts[0]) {
                    nodes.push.apply(nodes, contexts[0][query](selector));
                }
            }
            return nodes;
        },

        eq: function(i){
            return i === -1 ? this.slice(-1) : this.slice(i, i + 1);
        },

        not: function(selector){
            return this.filter(function(node){
                return node && !this(node, selector);
            }, matches_selector);
        },

        has: function(selector){
            return this.filter(function(node){
                return this(node, selector);
            }, matches_selector);
        },

        parent: find_near('parentNode'),

        parents: function(selector){
            var ancestors = new $(), p = this,
                finding = selector ? find_selector(selector, 'parentNode') : function(node){
                    return this[this.push(node.parentNode) - 1];
                };
            while (p.length) {
                p = p.map(finding, ancestors);
            }
            return ancestors;
        },

        closest: function(selector){
            var ancestors = new $(), p = this, 
                finding = find_selector(selector, 'parentNode');
            while (p.length && !ancestors.length) {
                p = p.map(finding, ancestors);
            }
            return ancestors.length && ancestors || this;
        },

        siblings: find_sibs(NEXT_SIB, FIRST_CHILD),

        next: find_near(NEXT_SIB),

        nextAll: find_sibs(NEXT_SIB),

        nextUntil: find_sibs(NEXT_SIB, false, true),

        prev: find_near(PREV_SIB),

        prevAll: find_sibs(PREV_SIB),

        prevUntil: find_sibs(PREV_SIB, false, true),

        children: function(){
            return _.merge.apply(_, this.map(function(node){
                return this(node.children);
            }, $));
        },

        contents: function(){
            return _.merge.apply(_, this.map(function(node){
                return this(node.childNodes);
            }, $));
        },

        // Detection

        is: function(selector){
            return this.some(function(node){
                return matches_selector(node, selector);
            });
        },

        hasClass: function(cname){
            for (var i = 0, l = this.length; i < l; i++) {
                if (this[i].classList.contains(cname)) {
                    return true;
                }
            }
            return false;
        },

        // Properties

        addClass: function(cname){
            return foreach_farg(this, cname, 'className', function(node, cname){
                node.classList.add(cname);
            });
        },

        removeClass: function(cname){
            return foreach_farg(this, cname, 'className', function(node, cname){
                node.classList.remove(cname);
            });
        },

        toggleClass: function(cname, force){
            return foreach_farg(this, cname, 'className', function(node, cname){
                node.classList[typeof this === 'undefined' && 'toggle'
                                    || this && 'add' || 'remove'](cname);
            }, force);
        },

        attr: kv_access(function(node, name, value){
            node.setAttribute(name, value);
        }, function(node, name){
            return node && node.getAttribute(name);
        }),

        removeAttr: function(name){
            this.forEach(function(node){
                node.removeAttribute(this);
            }, name);
            return this;
        },

        prop: kv_access(function(node, name, value){
            node[name] = value;
        }, function(node, name){
            return (node || {})[name];
        }),

        removeProp: function(name){
            this.forEach(function(node){
                delete node[this];
            }, name);
            return this;
        },

        data: kv_access(function(node, name, value){
            node.dataset[css_method(name)] = value;
        }, function(node, name){
            return (node || {}).dataset[css_method(name)];
        }),

        removeData: function(name){
            this.forEach(function(node){
                delete node.dataset[this];
            }, name);
            return this;
        },

        val: function(value){
            var node = this[0];
            if (value === undefined) {
                if (node) {
                    if (node.multiple) {
                        return $('option', this).filter(function(item){
                            return item.selected;
                        }).map(function(item){
                            return item.value;
                        });
                    }
                    return node.value;
                }
            } else {
                return foreach_farg(this, value, 'value', function(node, value){
                    node.value = value;
                });
            }
        },

        empty: function(){
            this.forEach(function(node){
                node.innerHTML = '';
            });
            return this;
        },

        html: function(str){
            return str === undefined ? (this[0] || {}).innerHTML
                : foreach_farg(this, str, 'innerHTML', function(node, str){
                    if (RE_HTMLTAG.test(str)) {
                        this(node).empty().append(str);
                    } else {
                        node.innerHTML = str;
                    }
                }, $);
        },

        text: function(str){
            return str === undefined ? (this[0] || {}).textContent
                : foreach_farg(this, str, 'textContent', function(node, str){
                    node.textContent = str;
                });
        },

        clone: function(){
            return this.map(function(node){
                return node.cloneNode(true);
            });
        },

        css: kv_access(function(node, name, value){
            var prop = css_prop(name);
            if (!value && value !== 0) {
                node.style.removeProperty(prop);
            } else {
                node.style.cssText += ';' + prop + ":" + css_unit(prop, value);
            }
        }, function(node, name){
            return node && (node.style[css_method(name)] 
                || _getComputedStyle(node, '').getPropertyValue(name));
        }, function(self, dict){
            var prop, value, css = '';
            for (var name in dict) {
                value = dict[name];
                prop = css_prop(name);
                if (!value && value !== 0) {
                    self.forEach(function(node){
                        node.style.removeProperty(this);
                    }, prop);
                } else {
                    css += prop + ":" + css_unit(prop, value) + ';';
                }
            }
            self.forEach(function(node){
                node.style.cssText += ';' + this;
            }, css);
        }),

        hide: function(){
            return this.css("display", "none");
        },

        show: function(){
            this.forEach(function(node){
                if (node.style.display === "none") {
                    node.style.display = null;
                }
                if (this(node, '').getPropertyValue("display") === "none") {
                    node.style.display = default_display(node.nodeName);
                }
            }, _getComputedStyle);
            return this;
        },

        // Dimensions

        offset: function(){
            var set = this[0].getBoundingClientRect();
            return {
                left: set.left + window.pageXOffset,
                top: set.top + window.pageYOffset,
                width: set.width,
                height: set.height
            };
        },

        width: dimension('Width'),

        height: dimension('Height'),

        // Manipulation

        appendTo: operator_insert_to(1),

        append: operator_insert(1),

        prependTo: operator_insert_to(3),

        prepend: operator_insert(3),

        insertBefore: operator_insert_to(2),

        before: operator_insert(2),

        insertAfter: operator_insert_to(4),

        after: operator_insert(4),

        replaceAll: function(targets){
            var t = $(targets);
            this.insertBefore(t);
            t.remove();
            return this;
        },

        replaceWith: function(contents){
            return $(contents).replaceAll(this);
        },

        wrap: function(boxes){
            return foreach_farg(this, boxes, false, function(node, boxes){
                this(boxes).insertBefore(node).append(node);
            }, $);
        },

        wrapAll: function(boxes){
            $(boxes).insertBefore(this.eq(0)).append(this);
            return this;
        },

        wrapInner: function(boxes){
            return foreach_farg(this, boxes, false, function(node, boxes){
                this(node).contents().wrapAll(boxes);
            }, $);
        },

        unwrap: function(){
            this.parent().forEach(function(node){
                this(node).children().replaceAll(node);
            }, $);
            return this;
        },

        remove: function(){
            this.forEach(function(node){
                var parent = node.parentNode;
                if (parent) {
                    parent.removeChild(node);
                }
            });
            return this;
        },

        // Event

        bind: event_access('add'),

        unbind: event_access('remove'),

        trigger: function(event, argv){
            if (typeof event === 'string') {
                event = Event(event);
            }
            _.mix(event, argv);
            this.forEach(event.type == 'submit' 
                && !event.defaultPrevented ? function(node){
                node.submit();
            } : function(node){
                if ('dispatchEvent' in node) {
                    node.dispatchEvent(this);
                }
            }, event);
            return this;
        },

        // Miscellaneous

        end: function(){
            return this.prevObject || new $();
        },

        each: function(fn){
            for (var i = 0, l = this.length; i < l; i++){
                var re = fn.call(this[i], i);
                if (re === false) {
                    break;      
                }
            }
            return this;
        }

    });

    // private

    function pick(v){ 
        return v; 
    }

    function matches_selector(elm, selector){
        return elm && elm[MATCHES_SELECTOR](selector);
    }

    function find_selector(selector, attr){
        return function(node){
            if (attr) {
                node = node[attr];
            }
            if (matches_selector(node, selector)) {
                this.push(node);
            }
            return node;
        };
    }

    function find_near(prop){
        return function(selector){
            return $(_.unique([undefined, doc, null].concat(
                this._map(selector ? function(node){
                    var n = node[prop];
                    if (n && matches_selector(n, selector)) {
                        return n;
                    }
                } : function(node){
                    return node[prop];
                })
            )).slice(3));
        };
    }

    function find_sibs(prop, start, has_until){
        return function(target, selector){
            if (!has_until) {
                selector = target;
            }
            var sibs = new $();
            this.forEach(function(node){
                var until,
                    n = start ? node.parentNode[start] : node;
                if (has_until) {
                    until = $(target, node.parentNode);
                }
                do {
                    if (until && until.indexOf(n) > -1) {
                        break;
                    }
                    if (node !== n && (!selector 
                        || matches_selector(n, selector))) {
                        this.push(n);
                    }
                } while (n = n[prop]);
            }, sibs);
            return _.unique(sibs);
        };
    }

    function foreach_farg(nodes, arg, prop, cb, context){
        var is_fn_arg = isFunction(arg);
        nodes.forEach(function(node, i){
            cb.call(context, node, !is_fn_arg ? arg
                : arg.call(this, i, prop && node[prop]));
        }, nodes);
        return nodes;
    }

    function kv_access(setter, getter, map){
        return function(name, value){
            if (typeof name === 'object') {
                if (map) {
                    map(this, name);
                } else {
                    for (var k in name) {
                        this.forEach(function(node){
                            setter(node, this, name[this]);
                        }, k);
                    }
                }
            } else {
                if (value !== undefined) {
                    var is_fn_arg = isFunction(value);
                    this.forEach(function(node, i){
                        setter(node, name, !is_fn_arg ? value 
                            : value.call(this, i, getter(node, name)));
                    }, this);
                } else {
                    return getter(this[0], name);
                }
            }
            return this;
        };
    }

    function event_access(action){
        function access(subject, cb){
            if (typeof subject === 'object') {
                for (var i in subject) {
                    access.call(this, [i, subject[i]]);
                }
            } else if (cb) {
                this.forEach(function(node){
                    node[action + 'EventListener'](subject, this, false);
                }, cb);
            }  // not support 'removeAllEventListener'
            return this;
        }
        return access;
    }

    function Event(type, props) {
        var bubbles = true,
            event = document.createEvent(SPECIAL_EVENTS[type] || 'Events');
        if (props) {
            if ('bubbles' in props) {
                bubbles = !!props.bubbles;
                delete props.bubbles;
            }
            _.mix(event, props);
        }
        event.initEvent(type, bubbles, true);
        return event;
    }

    function css_method(name){
        return name.replace(/-+(.)?/g, function($0, $1){
            return $1 ? $1.toUpperCase() : '';
        }); 
    }

    function css_prop(name) {
        return name.replace(/::/g, '/')
            .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
            .replace(/([a-z\d])([A-Z])/g, '$1_$2')
            .replace(/_/g, '-')
            .toLowerCase();
    }

    function css_unit(name, value) {
        return typeof value == "number" && !CSS_NUMBER[name] 
            && value + "px" || value;
    }

    function default_display(tag) {
        var display = _elm_display[tag];
        if (!display) {
            var tmp = document.createElement(tag);
            doc.body.appendChild(tmp);
            display = _getComputedStyle(tmp, '').getPropertyValue("display");
            tmp.parentNode.removeChild(tmp);
            if (display === "none") {
                display = "block";
            }
            _elm_display[tag] = display;
        }
        return display;
    }

    function dimension(method){
        return function(){
            var offset;
            return this[0] === window 
                ? window['inner' + method] 
                : this[0] === doc 
                    ? doc.documentElement['offset' + method] 
                    : (this.offset() || {})[method.toLowerCase()];
        };
    }

    function create_nodes(str, attrs){
        var tag = (RE_HTMLTAG.exec(str) || [])[0] || str;
        var temp = _html_containers[tag];
        if (!temp) {
            temp = _html_containers[tag] = tag === 'tr' && document.createElement('tbody')
                || (tag === 'tbody' || tag === 'thead' || tag === 'tfoot') 
                    && document.createElement('table')
                || (tag === 'td' || tag === 'th') && document.createElement('tr')
                || document.createElement('div');
        }
        temp.innerHTML = str;
        var nodes = new $();
        _array_push.apply(nodes, temp.childNodes);
        nodes.forEach(function(node){
            this.removeChild(node);
        }, temp);
        if (attrs) {
            for (var k in attrs) {
                nodes.attr(k, attrs[k]);
            }
        }
        return nodes;
    }

    function insert_node(target, node, action){
        if (node.nodeName.toUpperCase() === 'SCRIPT' 
                && (!node.type || node.type === 'text/javascript')) {
            window['eval'].call(window, node.innerHTML);
        }
        switch(action) {
            case 1: target.appendChild(node); break;
            case 2: target.parentNode.insertBefore(node, target); break;
            case 3: target.insertBefore(node, target.firstChild); break;
            case 4: target.parentNode.insertBefore(node, target.nextSibling); break;
            default: break;
        }
    }

    function insert_nodes(action, is_reverse){
        var fn = is_reverse ? function(target){
            insert_node(target, this, action);
        } : function(content){
            insert_node(this, content, action);
        };
        return function(elms){
            this.forEach(function(node){
                this.forEach(fn, node);
            }, $(elms));
            return this;
        };
    }

    function operator_insert_to(action){
        return insert_nodes(action, true);
    }

    function operator_insert(action){
        return insert_nodes(action);
    }

    // public static API

    $.find = $;
    $.matchesSelector = matches_selector;
    $.createNodes = create_nodes;
    $.camelize = css_method;
    $.dasherize = css_prop;
    $.Event = Event;

    $.VERSION = '1.1.1';

    return $;

});

/* @source moui/util/stick.js */;

/**
 * using AMD (Asynchronous Module Definition) API with OzJS
 * see http://ozjs.org for details
 *
 * Copyright (C) 2010-2012, Dexter.Yy, MIT License
 * vim: et:ts=4:sw=4:sts=4
 */
define('moui/util/stick', [
  "dollar",
  "mo/lang"
], function($, _){

    var window = this;

    /**
     * 让一个元素出现在指定位置（紧贴另一个元素，或者指定坐标）
     * @param {Array|DOM} t是坐标或紧贴的对象
     * @param {DOM|Array} box是需要定位的元素，当它是数组的时候表示不改变元素位置，只返回坐标值
     * @param {int} * clock用时钟指针位置表示从哪个方向对齐，比如7点表示下方偏右
     * @return {Object} 返回坐标
     */
    function stick(t, box, clock){
        var pos = Array.isArray(t) ? { 
                left: t[0], 
                top: t[1] 
            } : $(t).offset(),
            b = Array.isArray(box) ? { 
                w: box[0], 
                h: box[1] 
            } : {
                w: box.offsetWidth,
                h: box.offsetHeight
            },
            top, left,
            opt = clock, 
            win = $(window),
            v = {
                l : win[0].pageXOffset,
                t : win[0].pageYOffset,
                w : win.width(),
                h : win.height()
            };
        if (typeof opt === 'object') {
            clock = opt.clock;
        } else {
            opt = { clock: clock };
        }
        if (clock !==  undefined) { // t必须为DOM元素
            var f = parseInt(++clock / 3, 10),
                o = clock % 3;
            var toAlign = function(e, v1, v2, v3){
                if (e === 0) {
                    return v1;
                } else if (e === 1) {
                    return v1 - (v3 - v2)/2; //居中对齐
                } else if (e === 2) {
                    return v1 - (v3 - v2); 
                }
            };
            if (f === 0 || f === 4) { //顶部
                top = pos.top - b.h;
                left = toAlign(o, pos.left, t.offsetWidth, b.w);
            } else if (f === 1) { //右边
                top = toAlign(o, pos.top, t.offsetHeight, b.h);
                left = pos.left + (t.offsetWidth || 0);   
            } else if (f === 2) { //底部
                top = pos.top + (t.offsetHeight || 0);
                left = toAlign([2,1,0][o], pos.left, t.offsetWidth, b.w);
            } else if (f === 3) { //左边
                top = toAlign([2,1,0][o], pos.top, t.offsetHeight, b.h);
                left = pos.left - b.w;  
            }
        } else { //不需要对齐的时候，默认显示在目标下方，左对齐，并且根据窗口边界作出调整
            top = pos.top + (t.offsetHeight || 0);
            left = pos.left;
            opt.enableAlign = true;
        }
        if (opt.enableAlign) {
            if (top + b.h > v.t + v.h) {
                top = pos.top - b.h;
            } else if (top < 0) {
                top = 0;
            }
            if (left + b.w > v.l + v.w) {
                left = left + (t.offsetWidth || 0) - b.w;
            } else if (left < 0) {
                left = 0;
            }
        }
        
        if (box.constructor != Array) { //第二个参数是数组的时候表示不改变元素位置，只返回坐标值
            box.style.left = left + "px";
            box.style.top = top + "px";
        }
        
        return { t: top, l: left };
    }

    return stick;

});

/* @source moui/bubble.js */;


define('moui/bubble', [
  "mo/lang",
  "dollar",
  "moui/util/stick"
], function(_, $, stick){

    var window = this,
        TPL_BUBBLE = '<div class="moui-bubble"><div class="moui-content"></div><div class="moui-arrow"><div></div></div></div>',
        NEGATIVE = [6, 7, 8, 9, 10, 11, 12, 1, 2, 3, 4, 5, 6];

    function Bubble(opt){
        this._config = {};
        this._node = $(TPL_BUBBLE);
        this._content = this._node.find('.moui-content');
        this._arrow = this._node.find('.moui-arrow');
        this.set(opt);
        this._node.appendTo(this._config.window.document.body);
    }

    Bubble.prototype = {

        set: function(opt){
            var self = this;
            self._config.window = opt.window || window;
            if (opt.content) {
                self.setContent(opt.content);
            }
            if (opt.target) {
                this._config.target = opt.target;
            }
            if (opt.clock !== undefined) {
                this._config.clock = opt.clock;
            }
            return this;
        },

        setAlign: function(target, clock){
            if (target) {
                this._config.target = target;
            }
            if (clock === undefined) {
                clock = this._config.clock || 7;
            }
            var node = this._node,
                arrow_clock = NEGATIVE[clock],
                quadrant = Math.floor((arrow_clock + 1) / 3),
                align = arrow_clock % 3;
            node[0].className = node[0].className.replace(/(\w+\-arrow|\w+\-align)/, '');
            if (quadrant === 0 || quadrant === 4) {
                node.addClass('top-arrow')
                    .addClass(['center', 'left', 'right'][align] + '-align');
            } else if (quadrant === 1) {
                node.addClass('right-arrow')
                    .addClass(['center', 'top', 'bottom'][align] + '-align');
            } else if (quadrant === 2) {
                node.addClass('bottom-arrow')
                    .addClass(['center', 'right', 'left'][align] + '-align');
            } else if (quadrant === 3) {
                node.addClass('left-arrow')
                    .addClass(['center', 'bottom', 'top'][align] + '-align');
            }
            stick(this._config.target, this._node[0], clock);
            return this;
        },

        setContent: function(text){
            this._content.html(text);
            return this;
        },

        update: function(){
            this.setAlign(this._config.target, this._config.clock);
            return this;
        },

        show: function(){
            if (this.opened) {
                return;
            }
            this.opened = true;
            this._node.addClass('active');
            this.update();
            return this;
        },

        hide: function(){
            if (!this.opened) {
                return;
            }
            this.opened = false;
            this._node.removeClass('active');
            return this;
        },

        destroy: function() {
            if (!this.opened) {
                return;
            }
            this.opened = false;
            this._node.remove();
            return this;
        }

    };

    function exports(text, target, clock){
        return new exports.Bubble(typeof text === 'object' 
            ? text : {
                content: text,
                target: target,
                clock: clock
            });
    }

    exports.Bubble = Bubble;

    return exports;

});

/* @source buzz.js */;

// ----------------------------------------------------------------------------
// Buzz, a Javascript HTML5 Audio library
// v 1.0.x beta
// Licensed under the MIT license.
// http://buzz.jaysalvat.com/
// ----------------------------------------------------------------------------
// Copyright (C) 2011 Jay Salvat
// http://jaysalvat.com/
// ----------------------------------------------------------------------------
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files ( the "Software" ), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
// ----------------------------------------------------------------------------

var buzz = {
    defaults: {
        autoplay: false,
        duration: 5000,
        formats: [],
        loop: false,
        placeholder: '--',
        preload: 'metadata',
        volume: 80
    },
    types: {
        'mp3': 'audio/mpeg',
        'ogg': 'audio/ogg',
        'wav': 'audio/wav',
        'aac': 'audio/aac',
        'm4a': 'audio/x-m4a'
    },
    sounds: [],
    el: document.createElement( 'audio' ),

    sound: function( src, options ) {
        options = options || {};

        var doc = options.document || document;

        var pid = 0,
            events = [],
            eventsOnce = {},
            supported = buzz.isSupported();

        // publics
        this.load = function() {
            if ( !supported ) {
              return this;
            }

            this.sound.load();
            return this;
        };

        this.play = function() {
            if ( !supported ) {
              return this;
            }

            this.sound.play();
            return this;
        };

        this.togglePlay = function() {
            if ( !supported ) {
              return this;
            }

            if ( this.sound.paused ) {
                this.sound.play();
            } else {
                this.sound.pause();
            }
            return this;
        };

        this.pause = function() {
            if ( !supported ) {
              return this;
            }

            this.sound.pause();
            return this;
        };

        this.isPaused = function() {
            if ( !supported ) {
              return null;
            }

            return this.sound.paused;
        };

        this.stop = function() {
            if ( !supported  ) {
              return this;
            }

            this.setTime( 0 );
            this.sound.pause();
            return this;
        };

        this.isEnded = function() {
            if ( !supported ) {
              return null;
            }

            return this.sound.ended;
        };

        this.loop = function() {
            if ( !supported ) {
              return this;
            }

            this.sound.loop = 'loop';
            this.bind( 'ended.buzzloop', function() {
                this.currentTime = 0;
                this.play();
            });
            return this;
        };

        this.unloop = function() {
            if ( !supported ) {
              return this;
            }

            this.sound.removeAttribute( 'loop' );
            this.unbind( 'ended.buzzloop' );
            return this;
        };

        this.mute = function() {
            if ( !supported ) {
              return this;
            }

            this.sound.muted = true;
            return this;
        };

        this.unmute = function() {
            if ( !supported ) {
              return this;
            }

            this.sound.muted = false;
            return this;
        };

        this.toggleMute = function() {
            if ( !supported ) {
              return this;
            }

            this.sound.muted = !this.sound.muted;
            return this;
        };

        this.isMuted = function() {
            if ( !supported ) {
              return null;
            }

            return this.sound.muted;
        };

        this.setVolume = function( volume ) {
            if ( !supported ) {
              return this;
            }

            if ( volume < 0 ) {
              volume = 0;
            }
            if ( volume > 100 ) {
              volume = 100;
            }
          
            this.volume = volume;
            this.sound.volume = volume / 100;
            return this;
        };
      
        this.getVolume = function() {
            if ( !supported ) {
              return this;
            }

            return this.volume;
        };

        this.increaseVolume = function( value ) {
            return this.setVolume( this.volume + ( value || 1 ) );
        };

        this.decreaseVolume = function( value ) {
            return this.setVolume( this.volume - ( value || 1 ) );
        };

        this.setTime = function( time ) {
            if ( !supported ) {
              return this;
            }

            this.whenReady( function() {
                this.sound.currentTime = time;
            });
            return this;
        };

        this.getTime = function() {
            if ( !supported ) {
              return null;
            }

            var time = Math.round( this.sound.currentTime * 100 ) / 100;
            return isNaN( time ) ? buzz.defaults.placeholder : time;
        };

        this.setPercent = function( percent ) {
            if ( !supported ) {
              return this;
            }

            return this.setTime( buzz.fromPercent( percent, this.sound.duration ) );
        };

        this.getPercent = function() {
            if ( !supported ) {
              return null;
            }

			var percent = Math.round( buzz.toPercent( this.sound.currentTime, this.sound.duration ) );
            return isNaN( percent ) ? buzz.defaults.placeholder : percent;
        };

        this.setSpeed = function( duration ) {
			if ( !supported ) {
              return this;
            }

            this.sound.playbackRate = duration;
        };

        this.getSpeed = function() {
			if ( !supported ) {
              return null;
            }

            return this.sound.playbackRate;
        };

        this.getDuration = function() {
            if ( !supported ) {
              return null;
            }

            var duration = Math.round( this.sound.duration * 100 ) / 100;
            return isNaN( duration ) ? buzz.defaults.placeholder : duration;
        };

        this.getPlayed = function() {
			if ( !supported ) {
              return null;
            }

            return timerangeToArray( this.sound.played );
        };

        this.getBuffered = function() {
			if ( !supported ) {
              return null;
            }

            return timerangeToArray( this.sound.buffered );
        };

        this.getSeekable = function() {
			if ( !supported ) {
              return null;
            }

            return timerangeToArray( this.sound.seekable );
        };

        this.getErrorCode = function() {
            if ( supported && this.sound.error ) {
                return this.sound.error.code;
            }
            return 0;
        };

        this.getErrorMessage = function() {
			if ( !supported ) {
              return null;
            }

            switch( this.getErrorCode() ) {
                case 1:
                    return 'MEDIA_ERR_ABORTED';
                case 2:
                    return 'MEDIA_ERR_NETWORK';
                case 3:
                    return 'MEDIA_ERR_DECODE';
                case 4:
                    return 'MEDIA_ERR_SRC_NOT_SUPPORTED';
                default:
                    return null;
            }
        };

        this.getStateCode = function() {
			if ( !supported ) {
              return null;
            }

            return this.sound.readyState;
        };

        this.getStateMessage = function() {
			if ( !supported ) {
              return null;
            }

            switch( this.getStateCode() ) {
                case 0:
                    return 'HAVE_NOTHING';
                case 1:
                    return 'HAVE_METADATA';
                case 2:
                    return 'HAVE_CURRENT_DATA';
                case 3:
                    return 'HAVE_FUTURE_DATA';
                case 4:
                    return 'HAVE_ENOUGH_DATA';
                default:
                    return null;
            }
        };

        this.getNetworkStateCode = function() {
			if ( !supported ) {
              return null;
            }

            return this.sound.networkState;
        };

        this.getNetworkStateMessage = function() {
			if ( !supported ) {
              return null;
            }

            switch( this.getNetworkStateCode() ) {
                case 0:
                    return 'NETWORK_EMPTY';
                case 1:
                    return 'NETWORK_IDLE';
                case 2:
                    return 'NETWORK_LOADING';
                case 3:
                    return 'NETWORK_NO_SOURCE';
                default:
                    return null;
            }
        };

        this.set = function( key, value ) {
            if ( !supported ) {
              return this;
            }

            this.sound[ key ] = value;
            return this;
        };

        this.get = function( key ) {
            if ( !supported ) {
              return null;
            }

            return key ? this.sound[ key ] : this.sound;
        };

        this.bind = function( types, func ) {
            if ( !supported ) {
              return this;
            }

            types = types.split( ' ' );

            var that = this,
				efunc = function( e ) { func.call( that, e ); };

            for( var t = 0; t < types.length; t++ ) {
                var type = types[ t ],
                    idx = type;
                    type = idx.split( '.' )[ 0 ];

                    events.push( { idx: idx, func: efunc } );
                    this.sound.addEventListener( type, efunc, true );
            }
            return this;
        };

        this.unbind = function( types ) {
            if ( !supported ) {
              return this;
            }

            types = types.split( ' ' );

            for( var t = 0; t < types.length; t++ ) {
                var idx = types[ t ],
                    type = idx.split( '.' )[ 0 ];

                for( var i = 0; i < events.length; i++ ) {
                    var namespace = events[ i ].idx.split( '.' );
                    if ( events[ i ].idx == idx || ( namespace[ 1 ] && namespace[ 1 ] == idx.replace( '.', '' ) ) ) {
                        this.sound.removeEventListener( type, events[ i ].func, true );
                        // remove event
                        events.splice(i, 1);
                    }
                }
            }
            return this;
        };

        this.bindOnce = function( type, func ) {
            if ( !supported ) {
              return this;
            }

            var that = this;

            eventsOnce[ pid++ ] = false;
            this.bind( type + '.' + pid, function() {
               if ( !eventsOnce[ pid ] ) {
                   eventsOnce[ pid ] = true;
                   func.call( that );
               }
               that.unbind( type + '.' + pid );
            });
        };

        this.trigger = function( types ) {
            if ( !supported ) {
              return this;
            }

            types = types.split( ' ' );

            for( var t = 0; t < types.length; t++ ) {
                var idx = types[ t ];

                for( var i = 0; i < events.length; i++ ) {
                    var eventType = events[ i ].idx.split( '.' );
                    if ( events[ i ].idx == idx || ( eventType[ 0 ] && eventType[ 0 ] == idx.replace( '.', '' ) ) ) {
                        var evt = doc.createEvent('HTMLEvents');
                        evt.initEvent( eventType[ 0 ], false, true );
                        this.sound.dispatchEvent( evt );
                    }
                }
            }
            return this;
        };

        this.fadeTo = function( to, duration, callback ) {
			if ( !supported ) {
              return this;
            }

            if ( duration instanceof Function ) {
                callback = duration;
                duration = buzz.defaults.duration;
            } else {
                duration = duration || buzz.defaults.duration;
            }

            var from = this.volume,
				delay = duration / Math.abs( from - to ),
                that = this;
            this.play();

            function doFade() {
                setTimeout( function() {
                    if ( from < to && that.volume < to ) {
                        that.setVolume( that.volume += 1 );
                        doFade();
                    } else if ( from > to && that.volume > to ) {
                        that.setVolume( that.volume -= 1 );
                        doFade();
                    } else if ( callback instanceof Function ) {
                        callback.apply( that );
                    }
                }, delay );
            }
            this.whenReady( function() {
                doFade();
            });

            return this;
        };

        this.fadeIn = function( duration, callback ) {
            if ( !supported ) {
              return this;
            }

            return this.setVolume(0).fadeTo( 100, duration, callback );
        };

        this.fadeOut = function( duration, callback ) {
			if ( !supported ) {
              return this;
            }

            return this.fadeTo( 0, duration, callback );
        };

        this.fadeWith = function( sound, duration ) {
            if ( !supported ) {
              return this;
            }

            this.fadeOut( duration, function() {
                this.stop();
            });

            sound.play().fadeIn( duration );

            return this;
        };

        this.whenReady = function( func ) {
            if ( !supported ) {
              return null;
            }

            var that = this;
            if ( this.sound.readyState === 0 ) {
                this.bind( 'canplay.buzzwhenready', function() {
                    func.call( that );
                });
            } else {
                func.call( that );
            }
        };

        // privates
        function timerangeToArray( timeRange ) {
            var array = [],
                length = timeRange.length - 1;

            for( var i = 0; i <= length; i++ ) {
                array.push({
                    start: timeRange.start( length ),
                    end: timeRange.end( length )
                });
            }
            return array;
        }

        function getExt( filename ) {
            return filename.split('.').pop();
        }
        
        function addSource( sound, src ) {
            var source = doc.createElement( 'source' );
            source.src = src;
            if ( buzz.types[ getExt( src ) ] ) {
                source.type = buzz.types[ getExt( src ) ];
            }
            sound.appendChild( source );
        }

        // init
        if ( supported && src ) {
          
            for(var i in buzz.defaults ) {
              if(buzz.defaults.hasOwnProperty(i)) {
                options[ i ] = options[ i ] || buzz.defaults[ i ];
              }
            }

            this.sound = doc.createElement( 'audio' );

            if ( src instanceof Array ) {
                for( var j in src ) {
                  if(src.hasOwnProperty(j)) {
                    addSource( this.sound, src[ j ] );
                  }
                }
            } else if ( options.formats.length ) {
                for( var k in options.formats ) {
                  if(options.formats.hasOwnProperty(k)) {
                    addSource( this.sound, src + '.' + options.formats[ k ] );
                  }
                }
            } else {
                addSource( this.sound, src );
            }

            if ( options.loop ) {
                this.loop();
            }

            if ( options.autoplay ) {
                this.sound.autoplay = 'autoplay';
            }

            if ( options.preload === true ) {
                this.sound.preload = 'auto';
            } else if ( options.preload === false ) {
                this.sound.preload = 'none';
            } else {
                this.sound.preload = options.preload;
            }

            this.setVolume( options.volume );

            buzz.sounds.push( this );
        }
    },

    group: function( sounds ) {
        sounds = argsToArray( sounds, arguments );

        // publics
        this.getSounds = function() {
            return sounds;
        };

        this.add = function( soundArray ) {
            soundArray = argsToArray( soundArray, arguments );
            for( var a = 0; a < soundArray.length; a++ ) {
                sounds.push( soundArray[ a ] );
            }
        };

        this.remove = function( soundArray ) {
            soundArray = argsToArray( soundArray, arguments );
            for( var a = 0; a < soundArray.length; a++ ) {
                for( var i = 0; i < sounds.length; i++ ) {
                    if ( sounds[ i ] == soundArray[ a ] ) {
                        sounds.splice(i, 1);
                        break;
                    }
                }
            }
        };

        this.load = function() {
            fn( 'load' );
            return this;
        };

        this.play = function() {
            fn( 'play' );
            return this;
        };

        this.togglePlay = function( ) {
            fn( 'togglePlay' );
            return this;
        };

        this.pause = function( time ) {
            fn( 'pause', time );
            return this;
        };

        this.stop = function() {
            fn( 'stop' );
            return this;
        };

        this.mute = function() {
            fn( 'mute' );
            return this;
        };

        this.unmute = function() {
            fn( 'unmute' );
            return this;
        };

        this.toggleMute = function() {
            fn( 'toggleMute' );
            return this;
        };

        this.setVolume = function( volume ) {
            fn( 'setVolume', volume );
            return this;
        };

        this.increaseVolume = function( value ) {
            fn( 'increaseVolume', value );
            return this;
        };

        this.decreaseVolume = function( value ) {
            fn( 'decreaseVolume', value );
            return this;
        };

        this.loop = function() {
            fn( 'loop' );
            return this;
        };

        this.unloop = function() {
            fn( 'unloop' );
            return this;
        };

        this.setTime = function( time ) {
            fn( 'setTime', time );
            return this;
        };

        this.set = function( key, value ) {
            fn( 'set', key, value );
            return this;
        };

        this.bind = function( type, func ) {
            fn( 'bind', type, func );
            return this;
        };

        this.unbind = function( type ) {
            fn( 'unbind', type );
            return this;
        };

        this.bindOnce = function( type, func ) {
            fn( 'bindOnce', type, func );
            return this;
        };

        this.trigger = function( type ) {
            fn( 'trigger', type );
            return this;
        };

        this.fade = function( from, to, duration, callback ) {
            fn( 'fade', from, to, duration, callback );
            return this;
        };

        this.fadeIn = function( duration, callback ) {
            fn( 'fadeIn', duration, callback );
            return this;
        };

        this.fadeOut = function( duration, callback ) {
            fn( 'fadeOut', duration, callback );
            return this;
        };

        // privates
        function fn() {
            var args = argsToArray( null, arguments ),
                func = args.shift();

            for( var i = 0; i < sounds.length; i++ ) {
                sounds[ i ][ func ].apply( sounds[ i ], args );
            }
        }

        function argsToArray( array, args ) {
            return ( array instanceof Array ) ? array : Array.prototype.slice.call( args );
        }
    },

    all: function() {
      return new buzz.group( buzz.sounds );
    },

    isSupported: function() {
        return !!buzz.el.canPlayType;
    },

    isOGGSupported: function() {
        return !!buzz.el.canPlayType && buzz.el.canPlayType( 'audio/ogg; codecs="vorbis"' );
    },

    isWAVSupported: function() {
        return !!buzz.el.canPlayType && buzz.el.canPlayType( 'audio/wav; codecs="1"' );
    },

    isMP3Supported: function() {
        return !!buzz.el.canPlayType && buzz.el.canPlayType( 'audio/mpeg;' );
    },

    isAACSupported: function() {
        return !!buzz.el.canPlayType && ( buzz.el.canPlayType( 'audio/x-m4a;' ) || buzz.el.canPlayType( 'audio/aac;' ) );
    },

    toTimer: function( time, withHours ) {
        var h, m, s;
        h = Math.floor( time / 3600 );
        h = isNaN( h ) ? '--' : ( h >= 10 ) ? h : '0' + h;
        m = withHours ? Math.floor( time / 60 % 60 ) : Math.floor( time / 60 );
        m = isNaN( m ) ? '--' : ( m >= 10 ) ? m : '0' + m;
        s = Math.floor( time % 60 );
        s = isNaN( s ) ? '--' : ( s >= 10 ) ? s : '0' + s;
        return withHours ? h + ':' + m + ':' + s : m + ':' + s;
    },

    fromTimer: function( time ) {
        var splits = time.toString().split( ':' );
        if ( splits && splits.length == 3 ) {
            time = ( parseInt( splits[ 0 ], 10 ) * 3600 ) + ( parseInt(splits[ 1 ], 10 ) * 60 ) + parseInt( splits[ 2 ], 10 );
        }
        if ( splits && splits.length == 2 ) {
            time = ( parseInt( splits[ 0 ], 10 ) * 60 ) + parseInt( splits[ 1 ], 10 );
        }
        return time;
    },

    toPercent: function( value, total, decimal ) {
		var r = Math.pow( 10, decimal || 0 );

		return Math.round( ( ( value * 100 ) / total ) * r ) / r;
    },

    fromPercent: function( percent, total, decimal ) {
		var r = Math.pow( 10, decimal || 0 );

        return  Math.round( ( ( total / 100 ) * percent ) * r ) / r;
    }
};

/* autogeneration */
define("buzz-src", [], function(){});

/* @source eventmaster.js */;

/**
 * EventMaster
 * A simple, compact and consistent implementation of a variant of CommonJS's Promises and Events
 * Provide both Promise/Deferred/Flow pattern and Event/Notify/Observer/PubSub pattern
 *
 * using AMD (Asynchronous Module Definition) API with OzJS
 * see http://ozjs.org for details
 *
 * Copyright (C) 2010-2012, Dexter.Yy, MIT License
 * vim: et:ts=4:sw=4:sts=4
 */
define("eventmaster", [
  "mo/lang/es5",
  "mo/lang/mix",
  "mo/lang/struct"
], function(es5, _, struct){

    var fnQueue = struct.fnQueue,
        slice = Array.prototype.slice,
        pipes = ['notify', 'fire', 'error', 
            'resolve', 'reject', 'reset', 'disable', 'enable'];

    function Promise(opt){
        var self = this;
        if (opt) {
            this.subject = opt.subject;
            this.trace = opt.trace;
            this.traceStack = opt.traceStack || [];
        }
        this.doneHandlers = fnQueue();
        this.failHandlers = fnQueue();
        this.observeHandlers = fnQueue();
        this._alterQueue = fnQueue();
        this._lastDoneQueue = [];
        this._lastFailQueue = [];
        this.status = 0;
        this._argsCache = [];
        this.pipe = {};
        pipes.forEach(function(i){
            this[i] = function(){
                return self[i].call(self, slice.call(arguments));
            };
        }, this.pipe);
    }

    var actors = Promise.prototype = {

        then: function(handler, errorHandler){
            var _status = this.status;
            if (errorHandler) { // error, reject
                if (_status === 2) {
                    this._resultCache = errorHandler.apply(this, this._argsCache);
                } else if (!_status) {
                    this.failHandlers.push(errorHandler);
                    this._lastFailQueue = this.failHandlers;
                }
            } else {
                this._lastFailQueue = [];
            }
            if (handler) { // fire, resolve
                if (_status === 1) {
                    this._resultCache = handler.apply(this, this._argsCache);
                } else if (!_status) {
                    this.doneHandlers.push(handler);
                    this._lastDoneQueue = this.doneHandlers;
                }
            } else {
                this._lastDoneQueue = [];
            }
            return this;
        },

        done: function(handler){ // fire, resolve
            return this.then(handler);
        },

        fail: function(handler){ // error, reject
            return this.then(false, handler);
        },

        cancel: function(handler, errorHandler){ // then
            if (handler) { // done
                this.doneHandlers.clear(handler);
            }
            if (errorHandler) { // fail
                this.failHandlers.clear(errorHandler);
            }
            return this;
        },

        bind: function(handler){
            if (this.status) { // resolve, reject
                handler.apply(this, this._argsCache);
            }
            this.observeHandlers.push(handler); // notify, fire, error
            return this;
        },

        unbind: function(handler){ // bind
            this.observeHandlers.clear(handler);
            return this;
        },

        progress: function(handler){ // notify, fire?, error?
            var self = this;
            this.observeHandlers.push(function(){
                if (!self.status) {
                    handler.apply(this, arguments);
                }
            });
            return this;
        },

        notify: function(args){ // progress, bind
            if (this._disalbed) {
                return this;
            }
            this.status = 0;
            this.observeHandlers.apply(this, args || []);
            return this;
        },

        fire: function(args){ // bind, progress?, then, done
            if (this._disalbed) {
                return this;
            }
            if (this.trace) {
                this._trace();
            }
            args = args || [];
            var onceHandlers = this.doneHandlers;
            this.doneHandlers = this._alterQueue;
            this.failHandlers.length = 0;
            this.observeHandlers.apply(this, args);
            onceHandlers.apply(this, args);
            onceHandlers.length = 0;
            this._alterQueue = onceHandlers;
            return this;
        },

        error: function(args){ // bind, progress?, then, fail 
            if (this._disalbed) {
                return this;
            }
            if (this.trace) {
                this._trace();
            }
            args = args || [];
            var onceHandlers = this.failHandlers;
            this.failHandlers = this._alterQueue;
            this.doneHandlers.length = 0;
            this.observeHandlers.apply(this, args);
            onceHandlers.apply(this, args);
            onceHandlers.length = 0;
            this._alterQueue = onceHandlers;
            return this;
        },

        resolve: function(args){ // bind, then, done 
            this.status = 1;
            this._argsCache = args || [];
            return this.fire(args);
        },

        reject: function(args){ // bind, then, fail 
            this.status = 2;
            this._argsCache = args || [];
            return this.error(args);
        },

        reset: function(){ // resolve, reject
            this.status = 0;
            this._argsCache = [];
            this.doneHandlers.length = 0;
            this.failHandlers.length = 0;
            return this;
        },

        disable: function(){
            this._disalbed = true;
        },

        enable: function(){
            this._disalbed = false;
        },

        merge: function(promise){ // @TODO need testing
            _.merge(this.doneHandlers, promise.doneHandlers);
            _.merge(this.failHandlers, promise.failHandlers);
            _.merge(this.observeHandlers, promise.observeHandlers);
            var subject = promise.subject;
            _.mix(promise, this);
            promise.subject = subject;
        },

        _trace: function(){
            this.traceStack.unshift(this.subject);
            if (this.traceStack.length > this.trace) {
                this.traceStack.pop();
            }
        },

        follow: function(){
            var next = new Promise();
            next._prevActor = this;
            if (this.status) {
                pipe(this._resultCache, next);
            } else {
                var doneHandler = this._lastDoneQueue.pop();
                if (doneHandler) {
                    this._lastDoneQueue.push(function(){
                        return pipe(doneHandler.apply(this, arguments), next);
                    });
                }
                var failHandler = this._lastFailQueue.pop();
                if (failHandler) {
                    this._lastFailQueue.push(function(){
                        return pipe(failHandler.apply(this, arguments), next);
                    });
                }
            }
            return next;
        },

        end: function(){
            return this._prevActor;
        },

        all: function(){
            var fork = when.apply(this, this._when);
            return fork;
        },

        any: function(){
            var fork = when.apply(this, this._when);
            fork._count = fork._total = 1;
            return fork;
        },

        some: function(n){
            var fork = when.apply(this, this._when);
            fork._count = fork._total = n;
            return fork;
        }

    };

    function when(){
        var mutiArgs = [],
            completed = [],
            mutiPromise = new Promise();
        mutiPromise._when = [];
        mutiPromise._count = mutiPromise._total = arguments.length;
        Array.prototype.forEach.call(arguments, function(promise, i){
            var mutiPromise = this;
            mutiPromise._when.push(promise.bind(callback));
            function callback(args){
                if (!completed[i]) {
                    completed[i] = true;
                    mutiArgs[i] = args;
                    if (--mutiPromise._count === 0) {  // @TODO
                        completed.length = 0;
                        mutiPromise._count = mutiPromise._total;
                        mutiPromise.resolve.call(mutiPromise, mutiArgs);
                    }
                }
            }
        }, mutiPromise);
        return mutiPromise;
    }

    function pipe(prev, next){
        if (prev && prev.then) {
            prev.then(next.pipe.resolve, next.pipe.reject)
                .progress(next.pipe.notify);
        } else if (prev !== undefined) {
            next.resolve([prev]);
        }
        return prev;
    }

    function dispatchFactory(i){
        return function(subject){
            var promise = this.lib[subject];
            if (!promise) {
                promise = this.lib[subject] = new Promise({
                    subject: subject,
                    trace: this.trace,
                    traceStack: this.traceStack
                });
            }
            promise[i].apply(promise, slice.call(arguments, 1));
            return this;
        };
    }

    function Event(opt){
        if (opt) {
            this.trace = opt.trace;
            this.traceStack = opt.traceStack;
        }
        this.lib = {};
    }

    var EventAPI = Event.prototype = (function(methods){
        for (var i in actors) {
            methods[i] = dispatchFactory(i);
        }
        return methods;
    })({});

    EventAPI.once = EventAPI.wait = EventAPI.then;
    EventAPI.on = EventAPI.bind;
    EventAPI.off = EventAPI.unbind;

    EventAPI.promise = function(subject){
        var promise = this.lib[subject];
        if (!promise) {
            promise = this.lib[subject] = new Promise({
                subject: subject,
                trace: this.trace,
                traceStack: this.traceStack
            });
        }
        return promise;
    };

    EventAPI.when = function(){
        var args = [];
        for (var i = 0, l = arguments.length; i < l; i++) {
            args.push(this.promise(arguments[i]));
        }
        return when.apply(this, args);
    };

    function exports(opt){
        return new Event(opt);
    }

    exports.Promise = Promise;
    exports.Event = Event;
    exports.when = when;
    exports.pipe = pipe;

    exports.VERSION = '2.0.0';

    return exports;
});

/* @source mo/mainloop.js */;

/**
 * Implement and manage single loop for WebApp life cycle
 * Provide tweening API for both property animation and frame animation(canvas or css)
 *
 * using AMD (Asynchronous Module Definition) API with OzJS
 * see http://ozjs.org for details
 *
 * Copyright (C) 2010-2012, Dexter.Yy, MIT License
 * vim: et:ts=4:sw=4:sts=4
 */
define("mo/mainloop", [
  "mo/lang"
], function(_){

    var ANIMATE_FRAME = "RequestAnimationFrame",
        LONG_AFTER = 4000000000000,

        animateFrame = window['webkit' + ANIMATE_FRAME] || 
            window['moz' + ANIMATE_FRAME] || 
            window['o' + ANIMATE_FRAME] || 
            window['ms' + ANIMATE_FRAME],
        suid = 1,
        ruid = 1,
        fps_limit = 0,
        activeStages = [],
        renderlib = {},
        stageLib = {},

        _default_easing = {
            linear: function(x, t, b, c) {
                return b + c * x;
            },
            easeIn: function (x, t, b, c, d) {
                return c*(t/=d)*t + b;
            },
            easeOut: function (x, t, b, c, d) {
                return -c *(t/=d)*(t-2) + b;
            },
            easeInOut: function (x, t, b, c, d) {
                if ((t/=d/2) < 1) return c/2*t*t + b;
                return -c/2 * ((--t)*(t-2) - 1) + b;
            }
        },

        _default_config = {
            fps: 0,
            easing: _default_easing
        };

    function loop(timestamp){
        for (var i = 0, stage, l = activeStages.length; i < l; i++) {
            stage = activeStages[i];
            if (stage) {
                if (timestamp - stage.lastLoop >= fps_limit) {
                    stage.lastLoop = timestamp;
                    stage.renders.call(stage, timestamp);
                }
            }
        }
    }

    var mainloop = {

        config: function(opt){
            _.config(this, opt, _default_config);
            if (opt.fps) {
                fps_limit = this.fps ? (1000/this.fps) : 0;
            }
            if (opt.easing) {
                this.easing = _.mix(this.easing || {}, opt.easing);
            }
            return this;
        },

        run: function(name){
            if (name) {
                var stage = stageLib[name];
                if (!stage) {
                    this.addStage(name);
                    stage = stageLib[name];
                }
                if (stage && !stage.state) {
                    stage.state = 1;
                    activeStages.push(stage);
                    stage.renders.forEach(function(render){
                        var _delay = this.delays[render._rid];
                        if (_delay) {
                            _delay[3] = +new Date();
                            _delay[0] = setTimeout(_delay[1], _delay[2]);
                        }
                    }, stage);
                }
                if (this.globalSignal) {
                    return this;
                }
            }

            var self = this,
                frameFn = animateFrame,
                clearInterv = clearInterval,
                _loop = loop,
                timer,
                signal = ++suid;

            this.globalSignal = 1;

            function step(){
                if (suid === signal) {
                    var timestamp = +new Date();
                    _loop(timestamp);
                    if (self.globalSignal) {
                        if (frameFn) {
                            frameFn(step);
                        }
                    } else {
                        clearInterv(timer);
                    }
                }
            }

            if (frameFn) {
                frameFn(step);
            } else {
                timer = setInterval(step, 15);
            }
            return this;
        },

        pause: function(name){
            if (name) {
                var n = activeStages.indexOf(stageLib[name]);
                if (n >= 0) {
                    var stage = stageLib[name];
                    activeStages.splice(n, 1);
                    stage.state = 0;
                    stage.pauseTime = +new Date();
                    stage.renders.forEach(function(render){
                        var _delay = this.delays[render._rid];
                        if (_delay) {
                            clearTimeout(_delay[0]);
                            _delay[2] -= (this.pauseTime - _delay[3]);
                        }
                    }, stage);
                }
            } else {
                this.globalSignal = 0;
            }
            return this;
        },

        complete: function(name){
            var stage = stageLib[name];
            if (stage && stage.state) {
                stage.renders.forEach(function(render){
                    var _delay = stage.delays[render._rid];
                    if (_delay) {
                        clearTimeout(_delay[0]);
                        _delay[1]();
                    }
                    render.call(stage, this);
                }, LONG_AFTER);
                return this.remove(name);
            }
            return this;
        },

        remove: function(name, fn){
            if (fn) {
                var stage = stageLib[name];
                if (stage) {
                    clearTimeout((stage.delays[fn._rid] || [])[0]);
                    stage.renders.clear(fn);
                }
            } else {
                this.pause(name);
                delete stageLib[name];
            }
            return this;
        },

        info: function(name){
            return stageLib[name];
        },

        isRunning: function(name){
            return !!(stageLib[name] || {}).state;
        },

        addStage: function(name, ctx){
            if (name) {
                stageLib[name] = {
                    name: name,
                    ctx: ctx,
                    state: 0,
                    lastLoop: 0,
                    pauseTime: 0,
                    delays: {},
                    renders: _.fnQueue()
                };
            }
            return this;
        },

        addRender: function(name, fn, ctx){
            if (!stageLib[name]) {
                this.addStage(name, ctx);
            }
            this._lastestRender = fn;
            stageLib[name].renders.push(fn);
            return this;
        },

        getRender: function(renderId){
            return renderlib[renderId] || this._lastestRender;
        },

        addTween: function(name, current, end, duration, opt){
            var self = this,
                start, _delays,
                rid = opt.renderId,
                easing = opt.easing,
                lastPause = 0,
                d = end - current;
            function render(timestamp){
                if (lastPause !== this.pauseTime && start < this.pauseTime) {
                    lastPause = this.pauseTime;
                    start += +new Date() - lastPause;
                }
                var v, time = timestamp - start,
                    p = time/duration;
                if (time <= 0) {
                    return;
                }
                if (p < 1) {
                    if (easing) {
                        p = self.easing[easing](p, time, 0, 1, duration);
                    }
                    if (d < 0) {
                        p = 1 - p;
                        v = end + -1 * d * p;
                    } else {
                        v = current + d * p;
                    }
                }
                if (time >= duration) {
                    opt.step(end, duration);
                    self.remove(name, render);
                    if (opt.callback) {
                        opt.callback();
                    }
                } else {
                    opt.step(v, time);
                }
            }
            if (opt.delay) {
                if (!stageLib[name]) {
                    this.addStage(name);
                }
                if (!rid) {
                    rid = opt.renderId = '_oz_mainloop_' + ruid++;
                }
                _delays = stageLib[name].delays;
                var _timer = setTimeout(add_render, opt.delay);
                _delays[rid] = [_timer, add_render, opt.delay, +new Date()];
            } else {
                add_render();
            }
            if (rid) {
                render._rid = rid;
                renderlib[rid] = render;
            }
            function add_render(){
                if (_delays) {
                    delete _delays[rid];
                }
                if (duration) {
                    opt.step(current, 0);
                } else {
                    opt.step(end, 0);
                    if (opt.callback) {
                        setTimeout(function(){
                            opt.callback();
                        }, 0);
                    }
                    return;
                }
                start = +new Date();
                self.addRender(name, render);
            }
            return this;
        }

    };

    mainloop.config(_default_config);

    return mainloop;

});

/* @source choreo.js */;

/**
 * ChoreoJS
 * An animation library which uses "stage" and "actor" as metaphors
 * Automatic switch between CSS transitions and JS tweening
 * Provide a flexible way to write asynchronous sequence of actions
 * Support CSS transform value
 *
 * using AMD (Asynchronous Module Definition) API with OzJS
 * see http://ozjs.org for details
 *
 * Copyright (C) 2010-2012, Dexter.Yy, MIT License
 * vim: et:ts=4:sw=4:sts=4
 */
define("choreo", [
  "mo/lang/es5",
  "mo/lang/mix",
  "mo/mainloop",
  "eventmaster"
], function(es5, _, mainloop, Event){

    var window = this,
        VENDORS = ['', 'Moz', 'webkit', 'ms', 'O'],
        EVENT_NAMES = {
            '': 'transitionend',
            'Moz': 'transitionend',
            'webkit': 'webkitTransitionEnd',
            'ms': 'MSTransitionEnd',
            'O': 'oTransitionEnd'
        },
        TRANSIT_EVENT,
        TRANSFORM_PROPS = { 'rotate': -2, 
            'rotateX': -1, 'rotateY': -1, 'rotateZ': -1, 
            'scale': 2, 'scale3d': 3, 
            'scaleX': -1, 'scaleY': -1, 'scaleZ': -1, 
            'skew': 2, 'skewX': -1, 'skewY': -1, 
            'translate': 2, 'translate3d': 3, 
            'translateX': -1, 'translateY': -1, 'translateZ': -1 },
        TRANSFORM_DEFAULT = 'rotateX(0deg) rotateY(0deg) rotateZ(0deg)'
            + ' translateX(0px) translateY(0px) translateZ(0px)'
            + ' scaleX(1) scaleY(1) scaleZ(1) skewX(0deg) skewY(0deg)',
        ACTOR_OPS = ['target', 'prop', 'duration', 'easing', 'delay', 'to'],
        RE_TRANSFORM = /(\w+)\(([^\)]+)/,
        RE_PROP_SPLIT = /\)\s+/,
        RE_UNIT = /^[-\d\.]+/,
        test_elm = window.document.body,
        _arry_push = Array.prototype.push,
        _array_slice = Array.prototype.slice,
        _getComputedStyle = (document.defaultView || {}).getComputedStyle,
        vendor_prop = { 'transform': '', 'transition': '' },
        useCSS = false,
        parent_id = 0,
        hash_id = 0,
        stage_id = 0,
        render_id = 0,
        _hash_pool = [],
        _stage = {},
        _transition_sets = {},
        _transform_promise = {},
        timing_values = {
            linear: 'linear',
            easeIn: 'ease-in',
            easeOut: 'ease-out',
            easeInOut: 'ease-in-out'
        },
        timing_functions = {
            linear: function(x, t, b, c) {
                return b + c * x;
            },
            easeIn: function (x, t, b, c, d) {
                return c*(t/=d)*t + b;
            },
            easeOut: function (x, t, b, c, d) {
                return -c *(t/=d)*(t-2) + b;
            },
            easeInOut: function (x, t, b, c, d) {
                if ((t/=d/2) < 1) return c/2*t*t + b;
                return -c/2 * ((--t)*(t-2) - 1) + b;
            }
        };

    function fix_prop_name(lib, prefix, true_prop, succ){
        for (var prop in lib) {
            true_prop = prefix ? ('-' + prefix + '-' + prop) : prop;
            if (css_method(true_prop) in test_elm.style) {
                lib[prop] = true_prop;
                TRANSIT_EVENT = EVENT_NAMES[prefix];
                succ = true;
                continue;
            }
        }
        return succ;
    }
    
    for (var i = 0, l = VENDORS.length; i < l; i++) {
        if (fix_prop_name(vendor_prop, VENDORS[i])) {
            break;
        }
    }
    fix_prop_name(vendor_prop, '');

    var TRANSFORM = vendor_prop['transform'],
        TRANSITION = vendor_prop['transition'],
        TRANSFORM_METHOD = css_method(TRANSFORM),
        TRANSITION_METHOD = css_method(TRANSITION); 
    if (TRANSFORM_METHOD && TRANSITION_METHOD) {
        useCSS = true;
    }

    function Stage(name){
        if (!name) {
            name = '_oz_choreo_' + stage_id++;
        }
        if (_stage[name]) {
            return _stage[name];
        }
        var self = this;
        _stage[name] = this;
        this.name = name;
        this._promise = new Event.Promise();
        this._reset_promise = new Event.Promise();
        this._count = 0;
        this._optCache = [];
        if (useCSS) {
            this._runningActors = [];
        } else {
            mainloop.addStage(name);
        }
        this._reset_promise.bind(function(){
            self._promise.reset();
        });
    }

    Stage.prototype = {

        isPlaying: function(){
            return useCSS ? !!this._runningActors.state 
                : mainloop.isRunning(this.name);
        },

        isCompleted: function(){
            return this._count <= 0;
        },

        play: function(){
            // reinitialize all user-written opts if stage has completed
            if (this.isCompleted()) {
                clearTimeout(this._end_timer);
                this._reset_promise.fire();
                this._optCache.forEach(function(opt){
                    this.actor(opt);
                }, this);
            }
            // nothing happen if stage is running
            if (useCSS) {
                if (!this.isPlaying()) {
                    this._runningActors.state = 1;
                    this._runningActors.forEach(play);
                }
            } else {
                mainloop.run(this.name);
            }
            return this;
        },

        pause: function(){
            if (useCSS) {
                this._runningActors.state = 0;
                this._runningActors.forEach(stop);
            } else {
                mainloop.pause(this.name);
            }
            return this;
        },

        clear: function(){
            this.cancel();
            // remove all all user-written opts
            this._optCache.forEach(function(opt){
                opt._cached = false;
            });
            this._optCache.length = 0;
            return this;
        },

        cancel: function(){
            to_end(this, function(name, opt){
                if (useCSS) {
                    stop(opt);
                } else {
                    mainloop.remove(name);
                }
            });
            this._optCache.forEach(function(opt){
                opt._promise.reject([{
                    target: opt.target, 
                    succ: false
                }]).disable();
            });
            return this;
        },

        complete: function(){
            to_end(this, function(name, opt){
                if (useCSS) {
                    complete(opt);
                    opt._promise.resolve([{
                        target: opt.target, 
                        succ: true 
                    }]).disable();
                } else {
                    mainloop.complete(name);
                }
            });
            return this;
        },

        actor: function(opt, opt2){
            var self = this, name = this.name, actorObj, actors;

            // when new actor coming, cancel forthcoming complete event 
            clearTimeout(this._end_timer);

            // Actor Group
            if (opt2) {
                if (opt.nodeType) { // convert jquery style to mutiple Single Actor
                    var base_opt = {}, props;
                    ACTOR_OPS.forEach(function(op, i){
                        if (op === 'prop') {
                            props = this[i];
                        } else if (op !== 'to') {
                            base_opt[op] = this[i];
                        }
                    }, arguments);
                    actors = Object.keys(props).map(function(prop){
                        return self.actor(_.mix({ 
                            _parent: true,
                            prop: prop,
                            to: props[prop]
                        }, this));
                    }, base_opt);
                    if (actors.length === 1) {
                        return actors[0];
                    }
                } else { // convert multiple options to mutiple Single Actor
                    actors = _array_slice.call(arguments);
                    actors = actors.map(function(sub_opt){
                        sub_opt._parent = true;
                        return self.actor(sub_opt);
                    });
                }
                this._reset_promise.bind(when_reset);
                return actorObj = new Actor(actors, self);
            }

            // normalize opt 
            opt.prop = vendor_prop[opt.prop] || opt.prop;

            // reset opt
            if (opt._promise) {
                when_reset(opt._promise);
            }
            // @TODO avoid setting the same prop

            // convert from Transform Actor to Actor Group
            if (opt.prop === TRANSFORM) { 
                var transform_promise = promise_proxy(opt.target);
                actors = split_transform(opt.to, function(sub_opt){
                    _.merge(sub_opt, opt);
                    sub_opt._parent = true;
                    sub_opt._promise = transform_promise;
                    return self.actor(sub_opt);
                });
                this._reset_promise.bind(when_reset);
                return actorObj = new Actor(actors, self);
            }

            self._count++; // count actors created by user

            // Single Actor or Split Actor
            if (!opt._promise) {
                opt._promise = new Event.Promise();
            }
            if (useCSS) {
                this._runningActors.push(opt);
                if (this.isPlaying()) {
                    play(opt);
                }
            } else {
                render_opt(name, opt);
            }
            actorObj = new Actor(opt, self);

            if (!opt._cached) {
                // cache Single Actor and Split Actor
                opt._cached = true;
                this._optCache.push(opt);

                watch(actorObj);
            }

            function when_reset(promise){
                (promise || actorObj.follow()).reset().enable();
            }

            function watch(actor){
                actor.follow().bind(watcher);
                actor._opt._watcher = watcher;
                delete actor._opt._parent;
                return actor;
            }

            function watcher(res){
                if (--self._count > 0) {
                    return;
                }
                self._end_timer = setTimeout(function(){
                    to_end(self);
                    self._promise[
                        res.succ ? 'resolve': 'reject'
                    ]([{ succ: res.succ }]);
                }, 0);
            }

            return actorObj;
        },

        group: function(actor){
            var self = this,
                actorObj,
                actors = _array_slice.call(arguments).filter(function(actor){
                    return actor.stage === self;
                });
            this._reset_promise.bind(function(){
                actorObj.follow().reset().enable();
            });
            return actorObj = new Actor(actors, self);
        },

        follow: function(){
            return this._promise;
        }

    };

    function Actor(opt, stage){
        if (Array.isArray(opt)) { // Actor Group
            this.members = opt;
            opt = {
                _promise: Event.when.apply(Event, 
                    this.members.map(function(actor){
                        return actor.follow();
                    })
                )
            };
            opt._promise.bind(opt._promise.pipe.disable);
        }
        this._opt = opt;
        this.stage = stage;
    }

    Actor.prototype = {

        enter: function(stage){
            if (this.stage) {
                this.exit();
            }
            var actor = stage.actor.apply(
                stage, 
                [].concat(actor_opts(this))
            );
            actor.follow().merge(this.follow());
            return _.mix(this, actor);
        },

        exit: function(){
            var stage = this.stage,
                opt = this._opt;
            if (!stage) {
                return this;
            }
            if (this.members) {
                this.members = this.members.map(function(actor){
                    return actor.exit();
                });
            } else {
                if (useCSS) {
                    clear_member(stage._runningActors, opt);
                    if (stage.isPlaying()) {
                        stop(opt);
                    }
                } else {
                    mainloop.remove(stage.name, opt._render);
                }
                clear_member(stage._optCache, opt);
                opt._promise.reject([{
                    target: opt.target, 
                    succ: false
                }]).disable();
                // @TODO remove when_reset
            }
            var actor = this.fork();
            if (!opt._parent) {
                actor.follow().merge(opt._promise);
            }
            _.occupy(opt, actor._opt);
            delete this.stage;
            return this;
        },

        fork: function(){
            if (this.members) {
                return new Actor(this.members.map(function(actor){
                    return actor.fork();
                }));
            }
            var opt = {};
            ACTOR_OPS.forEach(function(i){
                opt[i] = this[i];
            }, this._opt);
            opt._promise = new Event.Promise(); // useless for member actor
            return new Actor(opt);
        },

        setto: function(v){
            return actor_setter(this, v, function(opt, v){
                return (v || v === 0) ? v : opt.to;
            });
        },

        extendto: function(v){
            return actor_setter(this, v, function(opt, v){
                if (!v) {
                    return opt.to;
                }
                var unit = get_unit(opt.to, v);
                return parseFloat(opt.to) + parseFloat(v) + unit;
            });
        },

        reverse: function(){
            return actor_setter(this, {}, function(opt){
                return opt.from !== undefined 
                    ? opt.from : opt._current_from;
            });
        },

        follow: function(){
            return this._opt._promise;
        }
        
    };

    function to_end(stage, fn){
        if (useCSS) {
            var _actors = stage._runningActors;
            if (stage.isPlaying()) {
                _actors.forEach(function(opt){
                    if (fn) {
                        fn(stage.name, opt);
                    }
                });
                _actors.state = 0;
                _actors.length = 0;
            }
        } else if (fn) {
            fn(stage.name);
        }
    }

    function stop(opt){
        var elm = opt.target,
            from = parseFloat(opt._current_from || opt.from),
            end = parseFloat(opt.to),
            d = end - from,
            time = opt._startTime ? (+new Date() - opt._startTime) : 0;
        if (time < 0) {
            time = 0;
        }
        var progress = time / (opt.duration || 1),
            hash = elm2hash(elm),
            sets = _transition_sets[hash];
        if (sets && sets[opt.prop] === opt) {
            clearTimeout((sets[opt.prop] || {})._runtimer);
            delete sets[opt.prop];
        } else {
            progress = 0;
        }
        if (!progress) {
            return;
        }
        var str = transitionStr(hash);
        elm.style[TRANSITION_METHOD] = str;
        if (progress < 1) { // pause
            if (timing_functions[opt.easing]) {
                progress = timing_functions[opt.easing](progress, time, 0, 1, opt.duration);
            }
            var unit = get_unit(opt.from, opt.to);
            from = from + d * progress + unit;
        } else { // complete
            from = opt.to;
        }
        set_style_prop(elm, opt.prop, from);
    }

    function complete(opt){
        var elm = opt.target,
            hash = elm2hash(elm),
            sets = _transition_sets[hash];
        if (sets) {
            delete sets[opt.prop];
        }
        var str = transitionStr(hash);
        elm.style[TRANSITION_METHOD] = str;
        set_style_prop(elm, opt.prop, opt.to);
    }

    function play(opt){
        var elm = opt.target,
            prop = opt.prop,
            hash = elm2hash(elm),
            sets = _transition_sets[hash],
            from = opt.from || get_style_value(elm, prop);
        if (from == opt.to) { // completed
            var completed = true;
            if (sets) {
                delete sets[prop];
            }
            if (TRANSFORM_PROPS[prop]) {
                for (var p in sets) {
                    if (TRANSFORM_PROPS[p]) {
                        completed = false; // wait for other transform prop
                        break;
                    }
                }
            }
            if (completed) {
                opt._promise.resolve([{
                    target: opt.target, 
                    succ: true 
                }]).disable();
            }
            return;
        }
        opt._current_from = from; // for pause or reverse
        opt._startTime = +new Date() + (opt.delay || 0);
        sets[prop] = opt;
        set_style_prop(elm, prop, from);
        var str = transitionStr(hash);
        opt._runtimer = setTimeout(function(){
            delete opt._runtimer;
            elm.style[TRANSITION_METHOD] = str;
            set_style_prop(elm, prop, opt.to);
        }, 0);
    }

    function render_opt(name, opt){
        var elm = opt.target,
            end = parseFloat(opt.to),
            from = opt.from || get_style_value(opt.target, opt.prop),
            unit = get_unit(from, opt.to);
        if (unit && from.toString().indexOf(unit) < 0) {
            from = 0;
        }
        opt._current_from = from; // for pause or reverse
        var current = parseFloat(from),
            rid = opt.delay && ('_oz_anim_' + render_id++);
        mainloop.addTween(name, current, end, opt.duration, {
            easing: opt.easing,
            delay: opt.delay,
            step: function(v){
                set_style_prop(elm, opt.prop, v + unit);
            },
            renderId: rid,
            callback: function(){
                opt._promise.resolve([{
                    target: elm,
                    succ: true
                }]).disable();
            }
        });
        opt._render = mainloop.getRender(rid);
    }

    function split_transform(value, fn){
        var to_lib = parse_transform(value);
        return Object.keys(to_lib).map(function(prop){
            return fn({
                prop: prop,
                to: this[prop]
            });
        }, to_lib);
    }

    function parse_transform(value){
        var lib = {};
        value.split(RE_PROP_SPLIT).forEach(function(str){
            var kv = str.match(/([^\(\)]+)/g),
                values = kv[1].split(/\,\s*/),
                isSupported = TRANSFORM_PROPS[kv[0]],
                is3D = isSupported === 3,
                isSingle = isSupported < 0 || values.length <= 1,
                xyz = isSingle ? [''] : ['X', 'Y', 'Z'];
            if (!isSupported) {
                return;
            }
            values.forEach(function(v, i){
                if (v && i <= xyz.length && is3D || isSingle && i < 1 || !isSingle && i < 2) {
                    var k = kv[0].replace('3d', '') + xyz[i];
                    this[k] = v;
                }
            }, this);
        }, lib);
        return lib;
    }

    function elm2hash(elm){
        var hash = elm._oz_fx;
        if (!hash) {
            hash = ++hash_id;
            elm._oz_fx = hash;
            elm.removeEventListener(TRANSIT_EVENT, when_transition_end);
            elm.addEventListener(TRANSIT_EVENT, when_transition_end);
        }
        if (!_transition_sets[hash]) {
            _transition_sets[hash] = {};
        }
        return hash;
    }

    function when_transition_end(e){
        e.stopPropagation();
        var self = this,
            hash = this._oz_fx,
            sets = _transition_sets[hash];
        if (sets) {
            if (e.propertyName === TRANSFORM) { 
                for (var i in TRANSFORM_PROPS) {
                    delete sets[i];
                }
                var promises = _transform_promise[hash] || [];
                this.style[TRANSITION_METHOD] = transitionStr(hash);
                promises.forEach(function(promise){
                    promise.resolve([{
                        target: self,
                        succ: true
                    }]).disable();
                }); 
            } else {
                var opt = sets[e.propertyName];
                if (opt) {
                    delete sets[opt.prop];
                    this.style[TRANSITION_METHOD] = transitionStr(hash);
                    if (opt._promise) {
                        opt._promise.resolve([{
                            target: this,
                            succ: true
                        }]).disable();
                    }
                }
            }
        }
    }

    function get_style_value(node, name){
        if (TRANSFORM_PROPS[name]) {
            return transform(node, name) || 0;
        }
        if (name === TRANSFORM) {
            return node && node.style[
                TRANSFORM_METHOD || name
            ] || TRANSFORM_DEFAULT;
        }
        var method = css_method(name);
        var r = node && (node.style[method] 
            || (_getComputedStyle 
                ? _getComputedStyle(node, '').getPropertyValue(name)
                : node.currentStyle[name]));
        return (r && /\d/.test(r)) && r || 0;
    }

    function set_style_prop(elm, prop, v){
        if (TRANSFORM_PROPS[prop]) {
            if (TRANSFORM) {
                transform(elm, prop, v);
            }
        } else {
            elm.style[css_method(prop)] = v;
        }
    }

    function transform(elm, prop, v){
        var current = parse_transform(get_style_value(elm, TRANSFORM));
        if (v) {
            var kv = parse_transform(prop + '(' + v + ')');
            _.mix(current, kv);
            elm.style[TRANSFORM_METHOD] = Object.keys(current).map(function(prop){
                return prop + '(' + this[prop] + ')';
            }, current).join(' ');
        } else {
            return current[prop] || prop === 'rotate' && '0deg';
        }
    }

    function transitionStr(hash){
        var sets = _transition_sets[hash];
        if (sets) {
            var str = [], opt;
            for (var prop in sets) {
                opt = sets[prop];
                if (opt && opt.prop) {
                    str.push([
                        TRANSFORM_PROPS[opt.prop] && TRANSFORM || opt.prop,
                        (opt.duration || 0) + 'ms',
                        timing_values[opt.easing] || 'linear',
                        (opt.delay || 0) + 'ms'
                    ].join(' '));
                }
            }
            return str.join(",");
        } else {
            return '';
        }
    }

    function get_unit(from, to){
        var from_unit = (from || '').toString().replace(RE_UNIT, ''),
            to_unit = (to || '').toString().replace(RE_UNIT, '');
        return parseFloat(from) === 0 && to_unit 
            || parseFloat(to) === 0 && from_unit 
            || to_unit || from_unit;
    }

    function css_method(name){
        return name.replace(/-+(.)?/g, function($0, $1){
            return $1 ? $1.toUpperCase() : '';
        }); 
    }

    function clear_member(array, member){
        var n = array.indexOf(member);
        if (n !== -1) {
            array.splice(n, 1);
        }
    }

    function promise_proxy(target){
        var transform_promise;
        if (useCSS) {
            transform_promise = new Event.Promise();
            var hash = elm2hash(target);
            if (!_transform_promise[hash]) {
                _transform_promise[hash] = [];
            }
            _transform_promise[hash].push(transform_promise);
        }
        return transform_promise;
    }

    function actor_opts(actor){
        if (actor.members) {
            // convert from Actor Group to original Transform Actor 
            var eg = actor.members[0]._opt;
            if (!TRANSFORM_PROPS[eg.prop]) {
                return actor.members.map(function(sub){
                    return actor_opts(sub);
                });
            } else {
                var opt = actor._opt = _.copy(eg);
                opt.prop = TRANSFORM;
                opt.to = actor.members.map(function(actor){
                    return actor._opt.prop + '(' + actor._opt.to + ')';
                }).join(' ');
                delete opt._parent;
            }
        }
        return actor._opt;
    }

    function actor_setter(actor, v, fn){
        var opt = actor._opt, 
            stage = actor.stage;
        if (stage && !stage.isCompleted()) {
            stage.cancel();
        }
        if (actor.members) {
            if (typeof v === 'string' 
                && TRANSFORM_PROPS[actor.members[0]._opt.prop]) {
                var lib = {};
                split_transform(v, function(sub_opt){
                    lib[sub_opt.prop] = sub_opt.to;
                });
                v = lib;
            }
            actor.members.forEach(function(actor){
                var mem_opt = actor._opt;
                mem_opt.to = fn(mem_opt, this[mem_opt.prop]);
            }, v);
        } else {
            opt.to = fn(actor._opt, v);
        }
        return actor;
    }

    function exports(name){
        return new Stage(name);
    }

    _.mix(exports, {

        VERSION: '1.0.1',
        renderMode: useCSS ? 'css' : 'js',
        Stage: Stage,
        Actor: Actor,

        config: function(opt){
            if (opt.easing) {
                _.mix(timing_values, opt.easing.values);
                _.mix(timing_functions, opt.easing.functions);
                mainloop.config({ easing: timing_functions });
            }
            if (/(js|css)/.test(opt.renderMode)) {
                useCSS = opt.renderMode === 'css';
                this.renderMode = opt.renderMode;
            }
        },

        transform: transform

    });

    return exports;

});

/* @source ../movie/demon.js */;


define("../movie/demon", [
  "mo/lang",
  "dollar",
  "eventmaster",
  "choreo",
  "buzz",
  "moui/bubble"
], function(_, $, event, choreo, buzz, bubble){

    var PREVIEW_DURATION = 10;

    function Demon(opt){
        var win = this.window = opt.window || window,
            body = $(win.document.body),
            origin = this.origin = $(opt.origin);
        this.preview_mode = false;
        this.walkSound = opt.walkSound;
        this._resolved_promise = event().resolve();
        this.eyeLeft = $('<span class="eye eye-left"><span></span></span>');
        this.eyeRight = $('<span class="eye eye-right"><span></span></span>');
        this.handLeft = $('<span class="hand hand-left"></span>');
        this.handRight = $('<span class="hand hand-right"></span>');
        this.legLeft = $('<span class="leg leg-left"></span>');
        this.legRight = $('<span class="leg leg-right"></span>');
        this.me = origin.clone().css({
            top: origin.offset().top + 'px',
            left: origin.offset().left + 'px'
        }).addClass('demon')
            .append(this.eyeLeft)
            .append(this.eyeRight)
            .append(this.handLeft)
            .append(this.handRight)
            .append(this.legLeft)
            .append(this.legRight)
            .appendTo(body);
        if (opt.className) {
            this.me.addClass(opt.className);
        }
        origin.css({
            visibility: 'hidden'
        });
    }

    Demon.prototype = {
    
        showBody: function(){
            this.me.addClass('waken');
            return this;
        },

        showEyes: function(){
            this.me.addClass('has-eyes');
            return this;
        },

        showHands: function(){
            this.me.addClass('has-hands');
            return this;
        },

        showLegs: function(){
            this.me.addClass('has-legs');
            return this;
        },

        rotateEye: function(deg, duration, easing){
            if (this.preview_mode) {
                duration = PREVIEW_DURATION;
            }
            var action = choreo().play(),
                v = 'rotate(' + deg + ')';
            action.actor(this.eyeLeft[0], {
                transform: v
            }, duration, easing);
            action.actor(this.eyeRight[0], {
                transform: v
            }, duration, easing);
            return action.follow();
        },

        moveEye: function(offset, duration, easing){
            if (this.preview_mode) {
                duration = PREVIEW_DURATION;
            }
            this.normalEye();
            var action = choreo().play(),
                left_pupil = this.eyeLeft.find('span')[0],
                max = this.eyeLeft[0].scrollHeight/2 - left_pupil.scrollHeight/2,
                v = 'translateX(' + offset * max + 'px)';
            action.actor(left_pupil, {
                transform: v
            }, duration, easing);
            action.actor(this.eyeRight.find('span')[0], {
                transform: v
            }, duration, easing);
            return action.follow();
        },

        squintEye: function(duration){
            if (this.preview_mode) {
                duration = PREVIEW_DURATION;
            }
            var self = this,
                promise = new event.Promise();
            this.rotateEye('0');
            this.moveEye(0);
            this.eyeLeft.concat(this.eyeRight).addClass('squint');
            setTimeout(function(){
                if (duration) {
                    self.normalEye();
                }
                promise.fire();
            }, duration || 0);
            return promise;
        },

        normalEye: function(){
            this.eyeLeft.concat(this.eyeRight).removeClass('squint');
            return this;
        }, 

        rotateHand: function(side, deg, duration, easing){
            if (this.preview_mode) {
                duration = PREVIEW_DURATION;
            }
            var action = choreo().play(),
                v = 'rotate(' + deg + ')';
            action.actor(this['hand' + capitalize(side)][0], {
                transform: v
            }, duration, easing);
            return action.follow();
        },

        waveHand: function(side, times, gap, deg, duration) {
            if (this.preview_mode) {
                duration = PREVIEW_DURATION;
            }
            side = side || 'left';
            times = times || 6;
            duration = duration || 400;
            gap = gap || 30;
            deg = deg || 150;

            var self = this;
            var ended = false;
            function doRotate() {
                if (!times) return;
                var d = deg + gap;
                if (ended) {
                    d = 30;
                    duration = 200;
                } else if (times == 1) {
                    ended = true;
                    times += 1;
                }
                self.rotateHand(side, d + 'deg', duration).done(function() {
                    times--;
                    gap = - gap;
                    doRotate();
                });
            }
            return doRotate();
        },

        rotateLeg: function(side, deg, duration, easing){
            if (this.preview_mode) {
                duration = PREVIEW_DURATION;
            }
            var action = choreo().play(),
                v = 'rotate(' + deg + ')';
            action.actor(this['leg' + capitalize(side)][0], {
                transform: v
            }, duration, easing);
            return action.follow();
        },

        jump: function(height, offsets, duration, easing){
            if (this.preview_mode) {
                duration = PREVIEW_DURATION;
            }
            var action = choreo(),
                action_drop = choreo(),
                me = this.me,
                current = parseFloat(me.css('top')) || 0;
            this.move(offsets || [], duration, easing);
            action.actor(me[0], {
                'top': current - parseFloat(height) + 'px'
            }, Math.ceil(duration*3/5), 'easeOutBack');
            return action.play().follow().done(function(){
                action_drop.actor(me[0], {
                    'top': current + 'px'
                }, Math.ceil(duration*2/5), 'easeInQuad');
                return action_drop.play().follow();
            }).follow();
        },

        move: function(offsets, duration, easing){
            if (this.preview_mode) {
                duration = PREVIEW_DURATION;
            }
            var self = this,
                action = choreo(),
                x = parseFloat(offsets[0] || 0),
                y = parseFloat(offsets[1] || 0),
                currentX = parseFloat(choreo.transform(this.me[0], 'translateX')) || 0,
                currentY = parseFloat(choreo.transform(this.me[0], 'translateY')) || 0;
            x += currentX,
            y += currentY;
        
            self.me.addClass('moving');

            action.actor(this.me[0], {
                'transform': 'translate(' + x + 'px, ' + y + 'px)'
            }, duration, easing);

            return action.play().follow().done(function(){
                self.me.removeClass('moving');
            });
        },

        walk: function(offsets, duration, easing, vol){
            if (this.preview_mode) {
                duration = PREVIEW_DURATION;
            }
            var left_action = choreo(),
                right_action = choreo(),
                is_end = false,
                left_lift = true,
                right_lift = true,
                x = parseFloat(offsets[0] || 0),
                y = parseFloat(offsets[1] || 0),
                length = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)),
                left = left_action.actor(this.legLeft[0], {
                    'height': parseFloat(this.legLeft.height())*3/5 + 'px'
                }, duration/length*8, 'easeInOut'),
                right = right_action.actor(this.legRight[0], {
                    'height': parseFloat(this.legRight.height())*3/5 + 'px'
                }, duration/length*8, 'easeInOut');

            left_action.play().follow().done(function(){
                right_action.play();
                return left_step();
            }).follow().done(left_step);

            right_action.follow().done(right_step);
            
            function left_step(){
                if (is_end && !left_lift) {
                    return false;
                }
                left.reverse();
                left_lift = !left_lift;
                return left_action.play().follow().done(function(){
                    return left_step();
                }).follow();
            }

            function right_step(){
                if (is_end && !right_lift) {
                    return false;
                }
                right.reverse();
                right_lift = !right_lift;
                return right_action.play().follow().done(function(){
                    return right_step();
                }).follow();
            }

            if (this.walkSound) {
                this.walkSound.loop();
                this.sound(this.walkSound, duration, vol || 100);
            }

            return this.move(offsets, duration, easing).done(function(){
                is_end = true;
            });
        },

        speak: function(text, duration, clock, src, vol){
            if (this.preview_mode) {
                duration = PREVIEW_DURATION;
            }
            var self = this,
                promise = new event.Promise();
            clearTimeout(self._wordsTimer);
            if (!self._words) {
                self._words = bubble({
                    target: self.me[0], 
                    window: self.window
                });
            }
            if (self._words.opened) {
                self._words.speakPromise.fire();
            }
            self._words.speakPromise = promise;
            self._words.set({
                content: text,
                clock: clock
            }).update();
            self._wordsTimer = setTimeout(function(){
                self._words.show();
                self._wordsTimer = setTimeout(function(){
                    self._words.hide();
                    self._wordsTimer = setTimeout(function(){
                        self._words.destroy();
                        promise.fire();
                    }, 400);
                }, 400 + duration);
                if (src) {
                    self.sound(src, duration, vol || 100);
                }
            }, 10);
            return promise;
        },

        sound: function(src, duration, vol){
            if (this.preview_mode) {
                duration = PREVIEW_DURATION;
            }
            var sound,
                promise = new event.Promise();
            if (typeof src === 'string' || Array.isArray(src)) {
                sound = new buzz.sound(src, {
                    document: this.window.document
                });
            } else {
                sound = src;
            }
            if (vol) {
                sound.setVolume(vol);
            }
            sound.play();
            setTimeout(function(){
                if (!sound.isEnded()) {
                    sound.pause();
                }
                promise.fire();
            }, duration);
            return promise;
        },

        follow: function(){
            return this._resolved_promise;
        }

    };

    function capitalize(str){
        return str.replace(/^\w/, function(s){
            return s.toUpperCase();
        });
    }

    function exports(opt){
        return new exports.Demon(opt);
    }

    exports.Demon = Demon;

    return exports;

});

/* @source ../movie/util.js */;


define("../movie/util", [
  "mo/lang",
  "dollar",
  "eventmaster",
  "../movie/demon",
  "moui/bubble"
], function(_, $, event, demon, bubble){

    var PREVIEW_DURATION = 10;

    var util = {

        demon: demon,
        bubble: bubble

    };

    util.wait = function(fn, duration){
        if (_.isFunction(fn)) {
            fn();
        } else {
            duration = fn;
        }
        if (util.preview_mode) {
            duration = PREVIEW_DURATION;
        }
        var promise = new event.Promise();
        setTimeout(function(){
            promise.resolve();
        }, duration);
        return promise;
    };

    util.showDemon = function(demon, duration){
        duration = duration || 400;
        if (util.preview_mode) {
            duration = PREVIEW_DURATION;
        }
        return util.wait(function(){
            demon.showBody();
        }, duration).done(function(){
            return util.wait(function(){
                demon.showEyes();
            }, duration);
        }).follow().done(function(){
            return util.wait(function(){
                demon.showLegs();
            }, duration);
        }).follow().done(function(){
            return util.wait(function(){
                demon.showHands();
            }, duration);
        }).follow();
    };

    return util;

});

/* @source mo/template/string.js */;

/**
 * using AMD (Asynchronous Module Definition) API with OzJS
 * see http://ozjs.org for details
 *
 * Copyright (C) 2010-2012, Dexter.Yy, MIT License
 * vim: et:ts=4:sw=4:sts=4
 */
define("mo/template/string", [], function(require, exports){

    exports.format = function(tpl, op){
        return tpl.replace(/\{\{(\w+)\}\}/g, function(e1,e2){
            return op[e2] != null ? op[e2] : "";
        });
    };

    exports.escapeHTML = function(str){
        str = str || '';
        var xmlchar = {
            //"&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            "'": "&#39;",
            '"': "&quot;",
            "{": "&#123;",
            "}": "&#125;",
            "@": "&#64;"
        };
        return str.replace(/[<>'"\{\}@]/g, function($1){
            return xmlchar[$1];
        });
    };

    exports.substr = function(str, limit, cb){
        if(!str || typeof str !== "string")
            return '';
        var sub = str.substr(0, limit).replace(/([^\x00-\xff])/g, '$1 ').substr(0, limit).replace(/([^\x00-\xff])\s/g, '$1');
        return cb ? cb.call(sub, sub) : (str.length > sub.length ? sub + '...' : sub);
    };

    exports.strsize = function(str){
        return str.replace(/([^\x00-\xff]|[A-Z])/g, '$1 ').length;
    };

});


/* @source mo/template/micro.js */;

/**
 * using AMD (Asynchronous Module Definition) API with OzJS
 * see http://ozjs.org for details
 *
 * Copyright (C) 2010-2012, Dexter.Yy, MIT License
 * vim: et:ts=4:sw=4:sts=4
 */
define("mo/template/micro", [
  "mo/lang",
  "mo/template/string"
], function(_, stpl, require, exports){

    var document = this.document;

    exports.tplSettings = {
        _cache: {},
        evaluate: /\{%([\s\S]+?)%\}/g,
        interpolate: /\{%=([\s\S]+?)%\}/g
    };
    exports.tplHelpers = {
        mix: _.mix,
        escapeHTML: stpl.escapeHTML,
        substr: stpl.substr,
        include: convertTpl,
        _has: function(obj){
            return function(name){
                return _.ns(name, undefined, obj);
            };
        }
    };

    function convertTpl(str, data, namespace){
        var func, c  = exports.tplSettings, suffix = namespace ? '#' + namespace : '';
        if (!/[\t\r\n% ]/.test(str)) {
            func = c._cache[str + suffix];
            if (!func) {
                var tplbox = document.getElementById(str);
                if (tplbox) {
                    func = c._cache[str + suffix] = convertTpl(tplbox.innerHTML, false, namespace);
                }
            }
        } else {
            func = new Function(namespace || 'obj', 'api', 'var __p=[];' 
                + (namespace ? '' : 'with(obj){')
                    + 'var mix=api.mix,escapeHTML=api.escapeHTML,substr=api.substr,include=api.include,has=api._has(' + (namespace || 'obj') + ');'
                    + '__p.push(\'' +
                    str.replace(/\\/g, '\\\\')
                        .replace(/'/g, "\\'")
                        .replace(c.interpolate, function(match, code) {
                            return "'," + code.replace(/\\'/g, "'") + ",'";
                        })
                        .replace(c.evaluate || null, function(match, code) {
                            return "');" + code.replace(/\\'/g, "'")
                                                .replace(/[\r\n\t]/g, ' ') + "__p.push('";
                        })
                        .replace(/\r/g, '\\r')
                        .replace(/\n/g, '\\n')
                        .replace(/\t/g, '\\t')
                    + "');" 
                + (namespace ? "" : "}")
                + "return __p.join('');");
        }
        return !func ? '' : (data ? func(data, exports.tplHelpers) : func);
    }

    exports.convertTpl = convertTpl;
    exports.reloadTpl = function(str){
        delete exports.tplSettings._cache[str];
    };

});


/* @source mo/template.js */;

/**
 * A lightweight and enhanced micro-template implementation, and minimum utilities
 *
 * using AMD (Asynchronous Module Definition) API with OzJS
 * see http://ozjs.org for details
 *
 * Copyright (C) 2010-2012, Dexter.Yy, MIT License
 * vim: et:ts=4:sw=4:sts=4
 */
define("mo/template", [
  "mo/lang",
  "mo/template/string",
  "mo/template/micro"
], function(_, stpl, microtpl, require, exports){

    _.mix(exports, stpl, microtpl);

    exports.str2html = function(str){ // @TODO 
        var temp = document.createElement("div");
        temp.innerHTML = str;
        var child = temp.firstChild;
        if (temp.childNodes.length == 1) {
            return child;
        }
        var fragment = document.createDocumentFragment();
        do {
            fragment.appendChild(child);
        } while (child = temp.firstChild);
        return fragment;
    };

});

/* @source mo/browsers.js */;

/**
 * Standalone jQuery.browsers supports skin browsers popular in China 
 *
 * using AMD (Asynchronous Module Definition) API with OzJS
 * see http://ozjs.org for details
 *
 * Copyright (C) 2010-2012, Dexter.Yy, MIT License
 * vim: et:ts=4:sw=4:sts=4
 */
define("mo/browsers", [], function(){

    var match, skin, 
        rank = { 
            "360ee": 2,
            "maxthon/3": 2,
            "qqbrowser": 2,
            "metasr": 2,
            "360se": 1,
            "theworld": 1,
            "maxthon": 1,
            "tencenttraveler": -1
        };

    try {
        var ua = navigator.userAgent.toLowerCase(),
            rmobilesafari = /apple.*mobile.*safari/,
            rwebkit = /(webkit)[ \/]([\w.]+)/,
            ropera = /(opera)(?:.*version)?[ \/]([\w.]+)/,
            rmsie = /(msie) ([\w.]+)/,
            rmozilla = /(mozilla)(?:.*? rv:([\w.]+))?/;

        var r360se = /(360se)/,
            r360ee = /(360ee)/,
            rtheworld = /(theworld)/,
            rmaxthon3 = /(maxthon\/3)/,
            rmaxthon = /(maxthon)\s/,
            rtt = /(tencenttraveler)/,
            rqq = /(qqbrowser)/,
            rmetasr = /(metasr)/;

        match = rmobilesafari.test(ua) && [0, "mobilesafari"] ||
            rwebkit.exec(ua) ||
            ropera.exec(ua) ||
            rmsie.exec(ua) ||
            ua.indexOf("compatible") < 0 && rmozilla.exec(ua) ||
            [];

        skin = r360se.exec(ua) || r360ee.exec(ua) || rtheworld.exec(ua) || 
            rmaxthon3.exec(ua) || rmaxthon.exec(ua) ||
            rtt.exec(ua) || rqq.exec(ua) ||
            rmetasr.exec(ua) || [];

    } catch (ex) {
        match = [];
        skin = [];
    }

    var result = { 
        browser: match[1] || "", 
        version: match[2] || "0",
        skin: skin[1] || ""
    };
    if (match[1]) {
        result[match[1]] = parseInt(result.version, 10) || true;
    }
    if (skin[1]) {
        result.rank = rank[result.skin] || 0;
    }
    result.shell = result.skin;

    return result;

});

/* @source mo/network/ajax.js */;

/**
 * using AMD (Asynchronous Module Definition) API with OzJS
 * see http://ozjs.org for details
 *
 * Copyright (C) 2010-2012, Dexter.Yy, MIT License
 * vim: et:ts=4:sw=4:sts=4
 */
define("mo/network/ajax", [
  "mo/browsers"
], function(browsers, require, exports){

    var httpParam = function(a) {
        var s = [];
        if (a.constructor == Array) {
            for (var i = 0; i < a.length; i++)
                s.push(a[i].name + "=" + encodeURIComponent(a[i].value));
        } else {
            for (var j in a)
                s.push(j + "=" + encodeURIComponent(a[j]));
        }
        return s.join("&").replace(/%20/g, "+");
    };

    /**
     * From jquery by John Resig
     */ 
    var ajax = function(s){
        var options = {
            type: s.type || "GET",
            url: s.url || "",
            data: s.data || null,
            dataType: s.dataType,
            contentType: s.contentType === false? false : (s.contentType || "application/x-www-form-urlencoded"),
            username: s.username || null,
            password: s.password || null,
            timeout: s.timeout || 0,
            processData: s.processData === undefined ? true : s.processData,
            beforeSend: s.beforeSend || function(){},
            complete: s.complete || function(){},
            handleError: s.handleError || function(){},
            success: s.success || function(){},
            accepts: {
                xml: "application/xml, text/xml",
                html: "text/html",
                script: "text/javascript, application/javascript",
                json: "application/json, text/javascript",
                text: "text/plain",
                _default: "*/*"
            }
        };
        
        if ( options.data && options.processData && typeof options.data != "string" )
            options.data = httpParam(options.data);
        if ( options.data && options.type.toLowerCase() == "get" ) {
            options.url += (options.url.match(/\?/) ? "&" : "?") + options.data;
            options.data = null;
        }
        
        var status, data, requestDone = false, xhr = window.ActiveXObject ? new ActiveXObject("Microsoft.XMLHTTP") : new XMLHttpRequest();
        xhr.open( options.type, options.url, true, options.username, options.password );
        try {
            if ( options.data && options.contentType !== false )
                xhr.setRequestHeader("Content-Type", options.contentType);
            xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
            xhr.setRequestHeader("Accept", s.dataType && options.accepts[ s.dataType ] ?
                options.accepts[ s.dataType ] + ", */*" :
                options.accepts._default );
        } catch(e){}
        
        if ( options.beforeSend )
            options.beforeSend(xhr);
            
        var onreadystatechange = function(isTimeout){
            if ( !requestDone && xhr && (xhr.readyState == 4 || isTimeout == "timeout") ) {
                requestDone = true;
                if (ival) {
                    clearInterval(ival);
                    ival = null;
                }

                status = isTimeout == "timeout" && "timeout" || !httpSuccess( xhr ) && "error" || "success";

                if ( status == "success" ) {
                    try {
                        data = httpData( xhr, options.dataType );
                    } catch(e) {
                        status = "parsererror";
                    }
                    
                    options.success( data, status );
                } else
                    options.handleError( xhr, status );
                options.complete( xhr, status );
                xhr = null;
            }
        };

        var ival = setInterval(onreadystatechange, 13); 
        if ( options.timeout > 0 )
            setTimeout(function(){
                if ( xhr ) {
                    xhr.abort();
                    if( !requestDone )
                        onreadystatechange( "timeout" );
                }
            }, options.timeout);    
            
        xhr.send(options.data);

        function httpSuccess(r) {
            try {
                return !r.status && location.protocol == "file:" || ( r.status >= 200 && r.status < 300 ) || r.status == 304 || r.status == 1223 || browsers.safari && r.status == undefined;
            } catch(e){}
            return false;
        }
        function httpData(r,type) {
            var ct = r.getResponseHeader("content-type");
            var xml = type == "xml" || !type && ct && ct.indexOf("xml") >= 0;
            var data = xml ? r.responseXML : r.responseText;
            if ( xml && data.documentElement.tagName == "parsererror" )
                throw "parsererror";
            if ( type == "script" )
                eval.call( window, data );
            if ( type == "json" )
                data = eval("(" + data + ")");
            return data;
        }
        return xhr;
    };

    exports.ajax = ajax;
    exports.params = httpParam;

});

/* @source mo/network.js */;

/**
 * Standalone jQuery.ajax API and enhanced getJSON, and so on
 *
 * using AMD (Asynchronous Module Definition) API with OzJS
 * see http://ozjs.org for details
 *
 * Copyright (C) 2010-2012, Dexter.Yy, MIT License
 * vim: et:ts=4:sw=4:sts=4
 */
define("mo/network", [
  "mo/lang",
  "mo/network/ajax"
], function(_, net, require, exports){

    var window = this,
        uuid4jsonp = 1;

    _.mix(exports, net);

    exports.getScript = function(url, op){
        var doc = _.isWindow(this) ? this.document : document,
            s = doc.createElement("script");
        s.type = "text/javascript";
        s.async = "async"; //for firefox3.6
        if (!op)
            op = {};
        else if (_.isFunction(op))
            op = { callback: op };
        if (op.charset)
            s.charset = op.charset;
        s.src = url;
        var h = doc.getElementsByTagName("head")[0];
        s.onload = s.onreadystatechange = function(__, isAbort){
            if ( isAbort || !s.readyState || /loaded|complete/.test(s.readyState) ) {
                s.onload = s.onreadystatechange = null;
                if (h && s.parentNode) {
                    h.removeChild(s);
                }
                s = undefined;
                if (!isAbort && op.callback) {
                    op.callback();
                }
            }
        };
        h.insertBefore(s, h.firstChild);
    };

    exports.getStyle = function(url){
        var doc = this.document || document,
            s = doc.createElement("link");
        s.setAttribute('type', 'text/css');
        s.setAttribute('rel', 'stylesheet');
        s.setAttribute('href', url);
        var h = doc.getElementsByTagName("head")[0];
        h.appendChild(s);
    };

    var RE_DOMAIN = /https?\:\/\/(.+?)\//;
    exports.getJSON = function(url, data, fn, op){
        var domain = url.match(RE_DOMAIN);
        if (!data || _.isFunction(data)) {
            op = fn;
            fn = data;
            data = {};
        }
        if (fn) {
            if ((!op || !op.isScript) && (!domain || domain[1] === window.location.host)) {
                exports.ajax({
                    url: url,
                    data: data,
                    success: fn,
                    error: op && op.error,
                    dataType: "json"
                });
                return true;
            }
        }
        op = _.mix({
            charset: "utf-8",
            callback: "__oz_jsonp" + (++uuid4jsonp)
        }, op || {});
        if (op.random) {
            data[op.random] = +new Date();
        }
        var cbName = op.callbackName || 'jsoncallback';
        data[cbName] = op.callback;
        url = [url, /\?/.test(url) ? "&" : "?", exports.httpParam(data)].join("");
        if (fn) {
            _.ns(op.callback, fn);
        }
        delete op.callback;
        exports.getScript(url, op);
    };

    exports.getRequest = function(url, params){
        var img = new Image();
        img.onload = function(){ img = null; }; //阻止IE下的自动垃圾回收引起的请求未发出状况
        img.src = !params ? url : [url, /\?/.test(url) ? "&" : "?", typeof params == "string" ? params : exports.httpParam(params)].join('');
    };

});

/* @source ../movie/director.js */;


define("../movie/director", [
  "mo/lang",
  "dollar",
  "mo/network",
  "mo/template",
  "buzz",
  "eventmaster",
  "../movie/util"
], function(_, $, net, tpl, buzz, event, util){

    var TPL_ANNOUNCE = '<h6>{%= order %}</h6><h2>{%= title %}</h2><div class="desc">{%= desc %}</div>',
        
        CHN_NUM = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'],
        DEFAULTS = {
            observer: event(),
            story: [],
            imageRoot: '',
            mediaRoot: '',
            stageStyle: ''
        },

        wait = util.wait,
        observer;

    var director = {

        init: function(opt){
            _.config(this, opt, DEFAULTS);
            this.currentChapter = 0;
            this.curtain = $('.curtain');
            this.stage = $('#stage');
            observer = opt.observer;
        },

        next: function(){
            if (this.lock) {
                return false;
            }
            var chapter = this.story[this.currentChapter++];
            if (!chapter) {
                this.currentChapter--;
                return false;
            }
            this.lock = true;

            switch(chapter.script) {
                case 'chapter1':
                    require('chapter1', load);
                    break;
                case 'chapter2':
                    require('chapter2', load);
                    break;
                case 'chapter3':
                    require('chapter3', load);
                    break;
                case 'chapter4':
                    require('chapter4', load);
                    break;
                case 'chapter5':
                    require('chapter5', load);
                    break;
                case 'chapter6':
                    require('chapter6', load);
                    break;
                default:
                    // code
            }

            function load(script){

                var sfx_lib = {};

                director.stage.bind('load', function(){
                    var win = this.contentWindow;
                    setTimeout(function(){
                        observer.fire('ready', [win]);
                    }, 200);
                }).attr('src', chapter.stage);

                observer.promise('ready').done(function(win){
                    net.getStyle.call(win, director.stageStyle);
                    net.getStyle.call(win, chapter.style);
                    var sfx_queue = [];
                    if (script.sfx) {
                        Object.keys(script.sfx).forEach(function(name){
                            var promise = new event.Promise();
                            var sound = sfx_lib[name] = new buzz.sound(director.mediaRoot + this[name], {
                                document: win.document
                            });
                            sound.load();
                            sound.bindOnce('canplay', function(){
                                promise.resolve([win]);
                            });
                            sfx_queue.push(promise);
                        }, script.sfx);
                    }
                    if (!sfx_queue.length) {
                        sfx_queue.push(new event.Promise().resolve([win]));
                    }
                    return event.when.apply(event, sfx_queue);
                }).follow().done(function(win){
                    return script.announce(function(title, desc, duration, src, vol){
                        var sound,
                            box = director.curtain.find('.announce')
                            .html(tpl.convertTpl(TPL_ANNOUNCE, {
                                order: director.currentChapter === director.story.length ? '尾声' 
                                    : ('第' + CHN_NUM[director.currentChapter - 1] + '章'),
                                title: title,
                                desc: desc
                            }))
                            .addClass('active');
                        if (typeof src === 'string' || Array.isArray(src)) {
                            sound = new buzz.sound(src, {
                                document: win.document
                            });
                        } else {
                            sound = src;
                        }
                        if (sound) {
                            if (vol) {
                                sound.setVolume(vol);
                            }
                            sound.play();
                        }
                        setTimeout(function(){
                            if (sound && !sound.isEnded()) {
                                sound.pause();
                            }
                            box.removeClass('active');
                            setTimeout(function(){
                               observer.fire('announceHidden');
                            }, 500);
                        }, duration || 1000);
                        return observer.promise('announceHidden');
                    }, sfx_lib).done(function(){
                        director.curtain.addClass('folded');
                        setTimeout(function(){
                            observer.fire('go', [win]);
                        }, 1000);
                        return observer.promise('go');
                    }).follow();
                }).follow().done(function(win){
                    return script.main(win, observer.promise('end'), sfx_lib, {
                        image: director.imageRoot,
                        media: director.mediaRoot
                    });
                }).follow().done(function(){
                    director.curtain.removeClass('folded');
                    director.lock = false;
                });

            }

        },

        prev: function(){

        }
    
    };
    
    return director;

});

/* @source mo/easing.js */;

/**
 * An easing library supports jquery.js, standalone module and CSS timing functions
 *
 * using AMD (Asynchronous Module Definition) API with OzJS
 * see http://ozjs.org for details
 *
 * Copyright (C) 2010-2012, Dexter.Yy, MIT License
 * vim: et:ts=4:sw=4:sts=4
 */
define("mo/easing", [], function(require, exports){

    var def = 'easeOutQuad';

    var timing_values = {
        //easeInQuad: 'cubic-bezier(0.550, 0.085, 0.680, 0.530)',
        //easeOutQuad: 'cubic-bezier(0.250, 0.460, 0.450, 0.940)',
        //easeInOutQuad: 'cubic-bezier(0.455, 0.030, 0.515, 0.955)',
        easeInCubic: 'cubic-bezier(0.550, 0.055, 0.675, 0.190)',
        easeOutCubic: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)',
        easeInOutCubic: 'cubic-bezier(0.645, 0.045, 0.355, 1.000)',
        easeInQuart: 'cubic-bezier(0.895, 0.030, 0.685, 0.220)',
        easeOutQuart: 'cubic-bezier(0.165, 0.840, 0.440, 1.000)',
        easeInOutQuart: 'cubic-bezier(0.770, 0.000, 0.175, 1.000)',
        easeInQuint: 'cubic-bezier(0.755, 0.050, 0.855, 0.060)',
        easeOutQuint: 'cubic-bezier(0.230, 1.000, 0.320, 1.000)',
        easeInOutQuint: 'cubic-bezier(0.860, 0.000, 0.070, 1.000)',
        easeInSine: 'cubic-bezier(0.470, 0.000, 0.745, 0.715)',
        easeOutSine: 'cubic-bezier(0.390, 0.575, 0.565, 1.000)',
        easeInOutSine: 'cubic-bezier(0.445, 0.050, 0.550, 0.950)',
        easeInExpo: 'cubic-bezier(0.950, 0.050, 0.795, 0.035)',
        easeOutExpo: 'cubic-bezier(0.190, 1.000, 0.220, 1.000)',
        easeInOutExpo: 'cubic-bezier(1.000, 0.000, 0.000, 1.000)',
        easeInCirc: 'cubic-bezier(0.600, 0.040, 0.980, 0.335)',
        easeOutCirc: 'cubic-bezier(0.075, 0.820, 0.165, 1.000)',
        easeInOutCirc: 'cubic-bezier(0.785, 0.135, 0.150, 0.860)',
        easeInBack: 'cubic-bezier(0.600, -0.280, 0.735, 0.045)',
        easeOutBack: 'cubic-bezier(0.175, 0.885, 0.320, 1.275)',
        easeInOutBack: 'cubic-bezier(0.680, -0.550, 0.265, 1.550)',
        easeInElastic: '',
        easeOutElastic: '',
        easeInOutElastic: '',
        easeInBounce: '',
        easeOutBounce: '',
        easeInOutBounce: ''
    };

    /**
     * jQuery Easing v1.3 - http://gsgd.co.uk/sandbox/jquery/easing/
     * t: current time, b: begInnIng value, c: change In value, d: duration
     */
    var timing_functions = {
        linear: function(x, t, b, c) {
            return b + c * x;
        },
        jswing: function(x, t, b, c) {
            return ((-Math.cos(x*Math.PI)/2) + 0.5) * c + b;
        },
        swing: function (x, t, b, c, d) {
            return timing_functions[def](x, t, b, c, d);
        },
        easeInQuad: function (x, t, b, c, d) {
            return c*(t/=d)*t + b;
        },
        easeOutQuad: function (x, t, b, c, d) {
            return -c *(t/=d)*(t-2) + b;
        },
        easeInOutQuad: function (x, t, b, c, d) {
            if ((t/=d/2) < 1) return c/2*t*t + b;
            return -c/2 * ((--t)*(t-2) - 1) + b;
        },
        easeInCubic: function (x, t, b, c, d) {
            return c*(t/=d)*t*t + b;
        },
        easeOutCubic: function (x, t, b, c, d) {
            return c*((t=t/d-1)*t*t + 1) + b;
        },
        easeInOutCubic: function (x, t, b, c, d) {
            if ((t/=d/2) < 1) return c/2*t*t*t + b;
            return c/2*((t-=2)*t*t + 2) + b;
        },
        easeInQuart: function (x, t, b, c, d) {
            return c*(t/=d)*t*t*t + b;
        },
        easeOutQuart: function (x, t, b, c, d) {
            return -c * ((t=t/d-1)*t*t*t - 1) + b;
        },
        easeInOutQuart: function (x, t, b, c, d) {
            if ((t/=d/2) < 1) return c/2*t*t*t*t + b;
            return -c/2 * ((t-=2)*t*t*t - 2) + b;
        },
        easeInQuint: function (x, t, b, c, d) {
            return c*(t/=d)*t*t*t*t + b;
        },
        easeOutQuint: function (x, t, b, c, d) {
            return c*((t=t/d-1)*t*t*t*t + 1) + b;
        },
        easeInOutQuint: function (x, t, b, c, d) {
            if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
            return c/2*((t-=2)*t*t*t*t + 2) + b;
        },
        easeInSine: function (x, t, b, c, d) {
            return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
        },
        easeOutSine: function (x, t, b, c, d) {
            return c * Math.sin(t/d * (Math.PI/2)) + b;
        },
        easeInOutSine: function (x, t, b, c, d) {
            return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
        },
        easeInExpo: function (x, t, b, c, d) {
            return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
        },
        easeOutExpo: function (x, t, b, c, d) {
            return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
        },
        easeInOutExpo: function (x, t, b, c, d) {
            if (t==0) return b;
            if (t==d) return b+c;
            if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
            return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
        },
        easeInCirc: function (x, t, b, c, d) {
            return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b;
        },
        easeOutCirc: function (x, t, b, c, d) {
            return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
        },
        easeInOutCirc: function (x, t, b, c, d) {
            if ((t/=d/2) < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
            return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;
        },
        easeInElastic: function (x, t, b, c, d) {
            var s=1.70158;var p=0;var a=c;
            if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
            if (a < Math.abs(c)) { a=c; var s=p/4; }
            else var s = p/(2*Math.PI) * Math.asin (c/a);
            return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
        },
        easeOutElastic: function (x, t, b, c, d) {
            var s=1.70158;var p=0;var a=c;
            if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
            if (a < Math.abs(c)) { a=c; var s=p/4; }
            else var s = p/(2*Math.PI) * Math.asin (c/a);
            return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
        },
        easeInOutElastic: function (x, t, b, c, d) {
            var s=1.70158;var p=0;var a=c;
            if (t==0) return b;  if ((t/=d/2)==2) return b+c;  if (!p) p=d*(.3*1.5);
            if (a < Math.abs(c)) { a=c; var s=p/4; }
            else var s = p/(2*Math.PI) * Math.asin (c/a);
            if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
            return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*.5 + c + b;
        },
        easeInBack: function (x, t, b, c, d, s) {
            if (s == undefined) s = 1.70158;
            return c*(t/=d)*t*((s+1)*t - s) + b;
        },
        easeOutBack: function (x, t, b, c, d, s) {
            if (s == undefined) s = 1.70158;
            return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
        },
        easeInOutBack: function (x, t, b, c, d, s) {
            if (s == undefined) s = 1.70158; 
            if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
            return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
        },
        easeInBounce: function (x, t, b, c, d) {
            return c - timing_functions.easeOutBounce (x, d-t, 0, c, d) + b;
        },
        easeOutBounce: function (x, t, b, c, d) {
            if ((t/=d) < (1/2.75)) {
                return c*(7.5625*t*t) + b;
            } else if (t < (2/2.75)) {
                return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
            } else if (t < (2.5/2.75)) {
                return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
            } else {
                return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
            }
        },
        easeInOutBounce: function (x, t, b, c, d) {
            if (t < d/2) return timing_functions.easeInBounce (x, t*2, 0, c, d) * .5 + b;
            return timing_functions.easeOutBounce (x, t*2-d, 0, c, d) * .5 + c*.5 + b;
        }
    };

    timing_values.easeIn = timing_values.easeInQuad = 'ease-in';
    timing_values.easeOut = timing_values.easeOutQuad = 'ease-out';
    timing_values.easeInOut = timing_values.easeInOutQuad = 'ease-in-out';

    timing_functions.easeIn = timing_functions.easeInQuad;
    timing_functions.easeOut = timing_functions.easeOutQuad;
    timing_functions.easeInOut = timing_functions.easeInOutQuad;

    exports.def = def;
    exports.values = timing_values;
    exports.functions = timing_functions;

});

/* @source mo/key.js */;

/**
 * Wrapping API for keyboard events
 * Support key sequence, multiple key press, ...
 *
 * using AMD (Asynchronous Module Definition) API with OzJS
 * see http://ozjs.org for details
 *
 * Copyright (C) 2010-2012, Dexter.Yy, MIT License
 * vim: et:ts=4:sw=4:sts=4
 */
define("mo/key", [
  "jquery",
  "mo/lang"
], function($, _){

    var specialKeys = {
            8: "backspace", 9: "tab", 13: "return", 16: "shift", 17: "ctrl", 18: "alt", 19: "pause",
            20: "capslock", 27: "esc", 32: "space", 33: "pageup", 34: "pagedown", 35: "end", 36: "home",
            37: "left", 38: "up", 39: "right", 40: "down", 45: "insert", 46: "del", 
            96: "0", 97: "1", 98: "2", 99: "3", 100: "4", 101: "5", 102: "6", 103: "7",
            104: "8", 105: "9", 106: "*", 107: "+", 109: "-", 110: ".", 111 : "/", 
            112: "f1", 113: "f2", 114: "f3", 115: "f4", 116: "f5", 117: "f6", 118: "f7", 119: "f8", 
            120: "f9", 121: "f10", 122: "f11", 123: "f12", 144: "numlock", 145: "scroll", 191: "/", 224: "meta"
        },
    
        shiftNums = {
            "`": "~", "1": "!", "2": "@", "3": "#", "4": "$", "5": "%", "6": "^", "7": "&", 
            "8": "*", "9": "(", "0": ")", "-": "_", "=": "+", ";": ":", "'": "\"", ",": "<", 
            ".": ">",  "/": "?",  "\\": "|"
        };

    function Keys(opt){
        opt = opt || {};
        var self = this;
        this.target = opt.target || document;
        this.keyHandlers = {};
        this.globalKeyHandlers = {};
        this.rules = [];
        this.sequence = {};
        this.sequenceNums = [];
        this.history = [];
        this.trace = opt.trace;
        this.traceStack = opt.traceStack || [];
        this.forTextarea = opt.forTextarea || false;
        this._handler = function(ev){
            if (self.forTextarea && (!/textarea|input/i.test(ev.target.nodeName) && ev.target.type !== 'text')) {
                return;
            }
            if ( !self.forTextarea && this !== ev.target && (/textarea|select/i.test(ev.target.nodeName) 
                    || ev.target.type === "text") ) {
                return;
            }

            var result, 
                is_disabled = self.lock || !self.check(this, ev),
                handlers = self.keyHandlers[ev.type],
                globalHandler = self.globalKeyHandlers[ev.type];

            if (handlers) {
                var possible = getKeys(ev),
                    handler,
                    queue_handler;

                for (var i in possible) {
                    handler = handlers[i];
                    if (handler) {
                        break;
                    }
                }

                if (self.sequenceNums.length && !is_disabled) {
                    var history = self.history;
                    history.push(i);
                    if (history.length > 10) {
                        history.shift();
                    }

                    if (history.length > 1) {
                        for (var j = self.sequenceNums.length - 1; j >= 0; j--) {
                            queue_handler = handlers[history.slice(0 - self.sequenceNums[j]).join("->")];
                            if (queue_handler) {
                                if (self.trace) {
                                    self._trace(j);
                                }
                                result = queue_handler.apply(this, arguments);
                                history.length = 0;
                                if (!result) {
                                    ev.preventDefault();
                                }
                                return result;
                            }
                        }
                    }
                }

                if (handler) {
                    if (is_disabled) {
                        return false;
                    }
                    if (self.trace) {
                        self._trace(i);
                    }
                    result = handler.apply(this, arguments);
                    if (!result) {
                        ev.preventDefault();
                    }
                }
            }

            if (globalHandler) {
                if (is_disabled) {
                    return false;
                }
                result = globalHandler.apply(this, arguments);
                if (!result) {
                    ev.preventDefault();
                }
            }

            return result;

        };
    }

    Keys.prototype = {

        addHandler: function(event, keyname, fn){
            var self = this,
                handlers = this.keyHandlers[event];
            if (!fn) {
                fn = keyname;
                keyname = '';
            }

            function add(kname){
                if (kname) {
                    var order = kname.split('->');
                    if (order.length > 1) {
                        self.sequence[order.length] = 1;
                        var seq = [];
                        for (var i in self.sequence) {
                            seq.push(parseInt(i, 10));
                        }
                        self.sequenceNums = seq.sort(function(a,b){ return a - b; });
                    }
                    var possible = kname.toLowerCase();
                    if (!handlers[possible]) {
                        handlers[possible] = _.fnQueue();
                    }
                    handlers[possible].push(fn);
                } else {
                    var globalHandlers = self.globalKeyHandlers[event];
                    if (!globalHandlers) {
                        globalHandlers = self.globalKeyHandlers[event] = _.fnQueue();
                    }
                    globalHandlers.push(fn);
                }
            }

            if (!handlers) {
                handlers = this.keyHandlers[event] = {};
                $(this.target).bind(event, this._handler);
            }
            if (Array.isArray(keyname)) {
                keyname.forEach(function(n){
                    add(n);
                });
            } else {
                add(keyname);
            }
            return this;
        },

        _trace: function(key){
            this.traceStack.unshift('[' + key + ']');
            if (this.traceStack.length > this.trace) {
                this.traceStack.pop();
            }
        },

        reset: function(){
            for (var event in this.keyHandlers) {
                $(this.target).unbind(event, this._handler);
            }
            this.keyHandlers = {};
            this.rules = [];
            this.history = [];
            delete this._handler;
            this.lock = false;
        },

        addRule: function(fn){
            this.rules.push(fn);
            return this;
        },

        enable: function(){
            this.lock = false;
        },

        disable: function(){
            this.lock = true;
        },

        check: function(target, ev){
            var re = true,
                r = this.rules;
            for (var i = 0, l = r.length; i < l; i++) {
                if (!r[i].call(target, ev)) {
                    re = false;
                    break;
                }
            }
            return re;
        }

    };

    (["down", "up", "press" ]).forEach(function(name){
        this[name] = function(keyname, fn){
            this.addHandler("key" + name, keyname, fn);
            return this;
        };
    }, Keys.prototype);


    function getKeys(event){
        // Keypress represents characters, not special keys
        var special = event.type !== "keypress" && specialKeys[ event.which ],
            character = String.fromCharCode( event.which ).toLowerCase(),
            key, modif = "", possible = {};

        // check combinations (alt|ctrl|shift+anything)
        if ( event.altKey && special !== "alt" ) {
            modif += "alt+";
        }

        if ( event.ctrlKey && special !== "ctrl" ) {
            modif += "ctrl+";
        }
        
        // TODO: Need to make sure this works consistently across platforms
        if ( event.metaKey && !event.ctrlKey && special !== "meta" ) {
            modif += "meta+";
        }

        if ( event.shiftKey && special !== "shift" ) {
            modif += "shift+";
        }

        if ( special ) {
            possible[ modif + special ] = true;
        } else {
            var k = modif + character;
            if (k) {
                possible[k] = true;
            }
            k = shiftNums[ character ];
            if (k) {
                possible[modif + k] = true;

                // "$" can be triggered as "Shift+4" or "Shift+$" or just "$"
                if ( modif === "shift+" ) {
                    k = shiftNums[ character ];
                    if (k) {
                        possible[k] = true;
                    }
                }
            }
        }

        return possible;
    }

    function KeysFactory(opt){
        return new Keys(opt);
    }

    KeysFactory.KEYS_CODE = specialKeys;

    return KeysFactory;

});



/* @source  */;


require.config({
    baseUrl: 'js/mod/',
    distUrl: 'dist/js/mod/',
    aliases: {
        movie: '../movie/'
    }
});

define('jquery', ['dollar'], function($){
    return $;
});

define('buzz-src', 'buzz.js');
define('buzz', ['buzz-src'], function(){
    return window.buzz;
});

define('chapter1', '../chapter/intro.js');
define('chapter2', '../chapter/guess.js');
define('chapter3', '../chapter/chaos.js');
define('chapter4', '../chapter/facebook.js');
define('chapter5', '../chapter/f2e.js');
define('chapter6', '../chapter/end.js');

require([
    'mo/lang',
    'dollar',
    'mo/key',
    'mo/easing',
    'choreo',
    'eventmaster',
    'movie/director',
    'mo/domready'
], function(_, $, key, easingLib, choreo, event, director){

    choreo.config({
        easing: easingLib
    });

    var story = [{
        stage: 'pages/index.html',
        style: '../dist/css/chapter/intro.css',
        script: 'chapter1'
    }, {
        stage: 'pages/update.html',
        style: '../dist/css/chapter/guess.css',
        script: 'chapter2'
    }, {
        stage: 'pages/update_old1.html',
        script: 'chapter3',
        style: '../dist/css/chapter/chaos.css'
    }, {
        stage: 'pages/facebook.html',
        style: '../dist/css/chapter/facebook.css',
        script: 'chapter4'
    }, {
        stage: 'pages/f2e.html',
        script: 'chapter5',
        style: '../dist/css/chapter/f2e.css'
    }, {
        stage: 'pages/end/guess.html',
        script: 'chapter6'
    }];

    var observer = event();

    director.init({
        observer: observer,
        story: story,
        imageRoot: 'pics/',
        mediaRoot: '../media/',
        stageStyle: '../dist/css/stage.css'
    });

    key().up(['space', 'right'], function(){
        director.next();
    });

    observer.bind('end', function(){
        setTimeout(function(){
            director.next();
        }, 500);
    });

    director.next();

});
