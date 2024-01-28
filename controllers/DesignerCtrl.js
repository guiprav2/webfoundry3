class DesignerCtrl {
  state = {
    actions: null,
    hasActionHandler: key => this.state.actions && Boolean(this.state.actions.kbds[key]),
    s: null,
    replacingClass: null,
  };

  actions = {
    setActionHandler: x => this.state.actions = x,
    select: x => this.state.s = x,
    command: x => this.state.actions.kbds[x](),
    replaceClass: x => this.state.replacingClass = x,
    reset: () => this.state.actions = this.state.s = this.state.replacingClass = null,
  };
}

export default DesignerCtrl;
