if (typeof Node === 'function' && Node.prototype) {
  // NOTE: if you've seen this error in sentry, it's very likely there's some 3rd party plugin
  // (mostly Google in-page translate) mutates the DOM, which is incompatible which react and
  // causes the page crash. This monkey patch is not able to maintain a correct dom. It only
  // prevent the page from crashing by not throwing exception.
  //
  // So, if you see this error, you STILL NEED TO FIX IT in your render code.
  //
  // The root cause of this kind of problem is that react wants to remove some node due to state
  // change, while this node is replaced by another node by some 3rd party plugins. Normally,
  // wrapping the node with a span with a key can solve the problem. The trick is to make react
  // not to remove the mutated node directly, but to remove the parent instead.
  //
  // refer to:
  // https://github.com/facebook/react/issues/11538
  // https://bugs.chromium.org/p/chromium/issues/detail?id=872770
  const originalRemoveChild = Node.prototype.removeChild;
  const getText = node => {
    try {
      if (node.wholeText) {
        return node.wholeText;
      }
      if (node.innerText) {
        return node.innerText;
      }
      return '';
    } catch {
      return '';
    }
  };
  Node.prototype.removeChild = function(child) {
    if (child.parentNode !== this) {
      if (console) {
        // If you see this error on sentry, please refer to above comment.
        console.error(`Cannot remove a child from a different parent, child text: ${getText(child)}`);
      }
      return child;
    }
    return originalRemoveChild.apply(this, arguments);
  };

  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function(newNode, referenceNode) {
    if (referenceNode && referenceNode.parentNode !== this) {
      if (console) {
        // If you see this error on sentry, please refer to above comment.
        console.error(
          `Cannot insert before a reference node from a different parent, reference node text: ${getText(
            referenceNode
          )}`
        );
      }
      return newNode;
    }
    return originalInsertBefore.apply(this, arguments);
  };
}

export {};