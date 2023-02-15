let Tag = new Proxy({}, {
  get(target, prop) {
    return (params) => {
      const el = document.createElement(prop);
      
      return el;
    }
  }
});