function joinPaths(...xs) { return xs.filter(Boolean).join('/') }

class LoadingManager {
  set = new Set();
  add(x) { this.set.add(x) }
  has(x) { this.set.has(x) }
  rm(x) { this.set.delete(x) }
}

let loadman = new LoadingManager();
export { joinPaths, loadman };
