class DesignerCtrl {
  state = {
    actions: null,
    hasActionHandler: key => this.state.actions && Boolean(this.state.actions.kbds[key]),
    toolbarCollapsed: false,
    s: null,
    sPrev: null,
    replacingClass: null,
  };

  actions = {
    setActionHandler: x => this.state.actions = x,
    toggleToolbar: () => this.state.toolbarCollapsed = !this.state.toolbarCollapsed,
    select: x => { this.state.sPrev = x ? null : this.state.s; this.state.s = x },
    command: x => this.state.actions.kbds[x](),
    replaceClass: x => this.state.replacingClass = x,
    reset: () => this.state.actions = this.state.s = this.state.replacingClass = null,
  };
}

export default DesignerCtrl;
