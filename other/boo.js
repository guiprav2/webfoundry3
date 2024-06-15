let resolve = x => typeof x === 'function' ? x() : x;

class Boo {
  constructor(ov, target, opt = {}) {
    Object.assign(this, {
      ov,
      target,
      ...opt,
      origin: opt.origin || document,
      container: opt.container || document.body,
      hiddenClass: opt.hiddenClass || 'hidden',
    });

    this.enable();
    this.frame();
  }

  frame = () => {
    if (!this.enabled) { return }
    let target = resolve(this.target);
    let container = resolve(this.container), origin = resolve(this.origin);
    let targetRect = target?.getBoundingClientRect?.();
    let originRect = origin?.getBoundingClientRect?.();
    let ov = resolve(this.ov);

    ov.style.borderRadius = targetRect && getComputedStyle(target).borderRadius;
    this.smallClass && ov.classList.toggle(this.smallClass,
      !targetRect || parseInt(targetRect.width, 10) < 48 || parseInt(targetRect.height, 10) < 48);

    if (this.transitionClass && this.lastTarget !== target) {
      ov.classList.add(this.transitionClass);
      ov.addEventListener('transitionend',
        () => ov.classList.remove(this.transitionClass), { once: true });
      this.lastTarget = target;
    }

    ov.classList[targetRect && container ? 'remove' : 'add'](this.hiddenClass);
    if (!ov.classList.contains(this.hiddenClass)) {
      ov.style.position = 'absolute';
      ov.style.boxSizing = 'border-box';
      if (container.style.position === 'static') {
        container.style.position = 'relative';
      }
      ov.style.left = `${originRect.left + targetRect.left}px`;
      ov.style.top = `${originRect.top + targetRect.top}px`;
      ov.style.width = `${targetRect.width}px`;
      ov.style.height = `${targetRect.height}px`;
    }

    window.requestAnimationFrame(this.frame);
  };

  enable(x = true) {
    if (x) { this.container.append(this.ov) } else { this.ov.remove() }
    this.enabled = x;
  }

  disable() { this.enable(false) }
}

export default Boo;