const rule = {
  meta: {
    docs: {
      description: "Disallow the use of 'data-heap-name' and suggest 'data-test-id' instead",
      category: "Best Practices",
      recommended: true,
    },
    fixable: "code",
    schema: [],
  },

  create(context) {
    return {
      JSXAttribute(node) {
        if (node.name.name === "data-heap-name") {
          context.report({
            node,
            message: "Use 'data-test-id' instead of 'data-heap-name'",
            fix(fixer) {
              const { name } = node;
              const newName = "data-test-id";
              return [
                fixer.replaceTextRange([name.start, name.end], newName),
              ];
            },
          });
        }
      },
    };
  },
};

module.exports = rule;