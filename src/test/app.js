import VRuntime from "../prototype2.js";

const VRuntime = new VRuntime();
const Atom = VRuntime.atomFactory();
const Computed = VRuntime.computedFactory();

const checkLists = {
  
  list: new Atom([]),
  
  actions: {
    createCheckList(name, items) {
      this.list.set([...this.list.get(), new Atom({ name, items })]);
    }
  }
  
};
