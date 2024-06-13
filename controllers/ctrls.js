import AppCtrl from './AppCtrl.js';

let sections = {
  app: new AppCtrl(),
};

let state = {};
for (let [k, v] of Object.entries(sections)) { state[k] = v.state = v.state || {} }

async function post(action, ...args) {
  let [ctrl, actionName] = action.split('.');
  let ret = await sections[ctrl].actions[actionName](...args);
  d.update();
  return ret;
}

export { state, post };
