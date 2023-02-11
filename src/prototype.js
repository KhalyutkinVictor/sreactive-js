
window.VRuntime = {
  
  observableMode: false,
  obsList: [],
  pullStack: [],
  
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
      obs.addSub(comp);
      comp.addPub(obs);
      obs.exitObsMode();
    }
    this.exitObservableMode();
    return result;
  },
  
  pushDepsInStack() {
    for (let comp of this.pullStack) {
      comp.calcActualVal();
    }
  },
  
  stackPush(comp) {
    this.pullStack.push(comp);
  },
  
  atomChanged() {
    this.pullStack = [];
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
  
  pubs = [];
  subs = [];
  
  addSub(reactive) {
    this.subs.push(reactive);
  }
  
  addPub(reactive) {
    this.pubs.push(reactive);
  }
  
  pushDeps() {
    for (let sub of this.subs) {
      sub.reactivePush();
    }
  }
  
  pullDeps() {
    for (let sub of this.subs) {
      sub.reactivePull();
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
    window.VRuntime.atomChanged();
    this.pullDeps();
  }
  
  get() {
    super.get();
    return this.val;
  }
  
}

class Computed extends Reactive {
  
  isCacheValid = false;
  cache = undefined;
  
  constructor(fn, lazy = true) {
    super();
    this.lazy = lazy;
    this._fn = fn;
    this.cache = window.VRuntime.runComputed(this, fn);
    this.isCacheValid = true;
  }
  
  calcActualVal() {
    this.cache = this._fn();
    this.isCacheValid = true;
    return this.cache;
  }
  
  reactivePush() {
    this.calcActualVal();
    this.pushDeps();
  }
  
  reactivePull() {
    this.isCacheValid = false;
    window.VRuntime.stackPush(this);
    if (!this.lazy) {
      window.VRuntime.pushDepsInStack();
    }
    this.pullDeps();
  }
  
  get() {
    super.get();
    return this.isCacheValid
      ? this.cache
      : this.calcActualVal();
  }
  
}