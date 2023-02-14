// Runtime that can work with async functions

/**
 * @property {VRuntime} runtime
 */
class __VR_ObsGetter {
  
  _obsMode = false;
  
  exitObsMode() {
    this._obsMode = false;
  }
  
  get(fn) {
    if (this.runtime.observableMode) {
      if (this._obsMode) {
        throw new Error('Circular dependencies');
      }
      this.runtime.addDep(this);
      this._obsMode = true;
    }
    let val = fn();
    this._obsMode = false;
    return val;
  }
  
}

/**
 * @property {VRuntime} runtime
 */
class __VR_Reactive extends __VR_ObsGetter {
  
  pubs = [];
  subs = [];
  
  addSub(reactive) {
    if (!this.subs.includes(reactive)) {
      this.subs.push(reactive);
    }
  }
  
  addPub(reactive) {
    if (!this.pubs.includes(reactive)) {
      this.pubs.push(reactive);
    }
  }
  
}

/**
 * @property {VRuntime} runtime
 */
class __VR_Atom extends __VR_Reactive {
  
  _val = undefined;
  
  constructor(val) {
    super();
    this._val = val;
  }
  
  set(val) {
    this._val = val;
    this.runtime.startReaction(this);
  }
  
  get() {
    return super.get(() => this._val);
  }

}

/**
 * @property {VRuntime} runtime
 */
class __VR_Computed extends __VR_Reactive {

  _fn = undefined;
  _val = undefined;
  isCacheValid = false;
  
  _isRegistered = false;
  
  constructor(fn, lazy = true) {
    super();
    this.lazy = lazy;
    this._fn = fn;
    if (!this.lazy) {
      this.register();
    }
  }

  get() {
    if (!this._isRegistered) {
      this.register();
    }
    return super.get(
      () => this.isCacheValid
        ? this._val
        : this.calcActualValue()
    );
  }
  
  register() {
    this.runtime.registerComputed(this);
    this._isRegistered = true;
  }
  
  calcActualValue() {
    this._val = this._fn();
    this.isCacheValid = true;
    return this._val;
  }
  
  pull() {
    if (!this.lazy) {
      this.calcActualValue();
      return;
    }
    this.isCacheValid = false;
    this.runtime.reactivePull(this);
  }
  
  push() {
    this.calcActualValue();
    for (let comp of this.subs) {
      this.runtime.reactivePush(comp);
    }
  }
  
}

class VRuntime {

  _atomClass = undefined;
  _computedClass = undefined;
  
  observableMode = false;
  
  obsList = [];
  
  /**
   * @param {{atomClass: Function, computedClass: Function}} config
   */
  constructor(config = {}) {
    config = {
      atomClass: __VR_Atom,
      computedClass: __VR_Computed,
      ...config
    };
    this._atomClass = config.atomClass;
    this._computedClass = config.computedClass;
  }
  
  registerComputed(comp) {
    this.observableMode = true;
    this.obsList = [];
    comp.calcActualValue();
    for (let reactive of this.obsList) {
      reactive.exitObsMode();
      reactive.addSub(comp);
      comp.addPub(reactive);
    }
    this.observableMode = false;
  }
  
  addDep(obs) {
    this.obsList.push(obs);
  }
  
  atomFactory() {
    if (!this._atomClass) {
      throw new Error('Atom class is not defined');
    }
    this._atomClass.prototype.runtime = this;
    return this._atomClass;
  }

  computedFactory() {
    if (!this._computedClass) {
      throw new Error('Computed class is not defined');
    }
    this._computedClass.prototype.runtime = this;
    return this._computedClass;
  }
  
  reactivePull(reactive) {
    for (let computed of reactive.subs) {
      computed.pull();
    }
  }
  
  reactivePush(reactive) {
    for (let computed of reactive.subs) {
      computed.push();
    }
  }
  
  startReaction(atom) {
    this.reactivePull(atom);
  }
  
}

export default VRuntime;