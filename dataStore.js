/* 
    Name : DataStore
    Description : Data structuring for the application
                  Stores recurring resources...
                  Such as images/profile data etc.  
*/

function DataStore(name, config) {
    this.queue = [];

    var config = config || {};
    if (!_.exists(name)) {
        throw new Error('DataStore object should have a name');
    }

    this.store = {};
    this.name = name;

    // Local Caching is enabled by default
    // Set config.localcache = false if you want to disable caching
    // Caching is done in the localStorage, overide this function and the set function to change this

    if (!_.exists(config.localcache)) {
        config.localcache = true;
    }

    this.config = config;

    if (this.config.localcache) {
        var tmp = JSON.parse(localStorage.getItem(this.name));
        if (tmp) {
            this.store = tmp;
        }
        for (var d in tmp) {
            if (tmp.hasOwnProperty(d)) {
                this.queue.push(d);
            }
        }
    }
    return this;
}

DataStore.prototype._getStore = function() {
    return this.store;
}

DataStore.prototype._getQueue = function() {
    return this.queue;
}

DataStore.prototype._pushToQueue = function(id) {
    this.queue.push(id);
}

DataStore.prototype._inQueue = function(id) {
    for (var i = 0; i < this.queue.length; i++) {
        if (this.queue[i] === id) return true;
    }
    return false;
}

DataStore.prototype._removeOldestValue = function() {
    this.store = JSON.parse(localStorage.getItem(this.name));
    var id = this.queue.shift();
    delete this.store[id];
    localStorage.setItem(this.name, JSON.stringify(this.store));
}

DataStore.prototype.set = function(id, val) {
    if (this.config.localcache) {
        var self = this;
        try {
            self.store[id] = val;
            localStorage.setItem(this.name, JSON.stringify(this.store));
            if (!this._inQueue(id)) this._pushToQueue(id);
        } catch (e) {
            console.log(e);
            self._removeOldestValue();
            self.set(id, val);
        }
    } else {
        this.store[id] = val;
    }
};