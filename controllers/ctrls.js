import AppCtrl from './AppCtrl.js';
import EditorCtrl from './EditorCtrl.js';

let sections = {
  app: new AppCtrl(),
  editor: new EditorCtrl(),
};

let state = {};
for (let [k, v] of Object.entries(sections)) { state[k] = v.state = v.state || {} }

async function post(action, ...args) {
  let [ctrl, actionName] = action.split('.');
  let handler = sections[ctrl]?.actions?.[actionName];
  if (!handler) { throw new Error(`Unknown controller or action: ${action}`) }
  let ret = await handler(...args);
  d.update();
  return ret;
}

export { state, post };
