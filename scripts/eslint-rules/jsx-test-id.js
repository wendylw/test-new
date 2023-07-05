const rule = {
  meta: {
    docs: {
      description: "Enforce presence of a specified attribute on JSX elements with another specified attribute",
      category: "Best Practices",
      recommended: true,
    },
    schema: [
      {
        type: "object",
        properties: {
          ifExist: {
            anyOf: [
              {
                type: "string",
              },
              {
                type: "array",
                items: {
                  type: "string",
                },
                minItems: 1,
              },
            ],
            default: "onClick",
          },
          shouldExist: {
            type: "string",
            default: "data-test-id",
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    const { ifExist = 'onClick', shouldExist = 'data-test-id' } = context.options[0] || {};

    const ifExistAttrs = Array.isArray(ifExist) ? ifExist : [ifExist];

    return {
      JSXAttribute(node) {
        if (ifExistAttrs.includes(node.name.name)) {
          const parent = node.parent;
          const hasShouldExist = parent.attributes.some(
            (attr) => (attr.name && attr.name.name) === shouldExist
          );

          if (!hasShouldExist) {
            context.report({
              node: parent,
              message: `JSX element with '${node.name.name}' prop must also have '${shouldExist}' prop`,
            });
          }
        }
      },
    };
  },
};

module.exports = rule;