
window.VRuntime = {
  
  observableMode: false,
  obsList: [],
  
  enterObservableMode() {
    if (!this.observableMode) {
      this.observableMode = true;
      this.obsList = [];
    }
  },
  
  exitObservableMode() {
    this.observableMode = false;
    this.obsList = [];
  },
  
  runComputed(comp, fn) {
    this.enterObservableMode();
    let result = fn();
    for (let obs of this.obsList) {
      obs.addDep(comp);
      obs.exitObsMode();
    }
    this.exitObservableMode();
    return result;
  }
  
};

class ObsGetter {
  
  _obsMode = false;
  
  exitObsMode() {
    this._obsMode = false;
  }
  
  get() {
    if (window.VRuntime.observableMode) {
      if (this._obsMode) {
        throw new Error('Circular dependencies');
      }
      window.VRuntime.obsList.push(this);
      this._obsMode = true;
    }
  }
  
}

class Reactive extends ObsGetter {
  
  deps = [];
  
  addDep(dep) {
    this.deps.push(dep);
  }
  
  pushDeps() {
    for (let dep of this.deps) {
      dep.refreshCache();
    }
  }
  
}

class Atom extends Reactive {
  
  constructor(val) {
    super();
    this.val = val;
  }
  
  set(val) {
    this.val = val;
    this.pushDeps();
  }
  
  get() {
    super.get();
    return this.val;
  }
  
}

class Computed extends Reactive {
  
  isCacheValid = false;
  cache = undefined;
  
  constructor(fn) {
    super();
    this._fn = fn;
    this.cache = window.VRuntime.runComputed(this, fn);
    this.isCacheValid = true;
  }
  
  refreshCache() {
    this.cache = this._fn();
    this.isCacheValid = true;
    this.pushDeps();
  }
  
  get() {
    super.get();
    return this.isCacheValid
      ? this.cache
      : this.refreshCache();
  }
  
}