import type { TFAFConfig } from '@morriconeluca/eslint-plugin-faf';

export default {
  faf: {
    locals: [
      {
        horizontalHierarchies: [
          [['_atoms'], ['_molecules'], ['_organisms'], ['_templates']],
          [
            ['_primitives'],
            ['_compounds'],
            ['_aggregates'],
            ['_systems'],
            ['_ecosystems'],
          ],
        ],
        publicRootNodes: ['src/main.tsx'],
        roles: [
          {
            allowMultipleSymbols: true,
            category: '_styles',
            implicitRoleExtensions: ['.css'],
            name: 'style',
          },
          {
            allowMultipleSymbols: true,
            category: '_constants',
            isCategoryNode: true,
            name: 'constant',
          },
          { category: '_schemas', name: 'schema' },
          {
            allowMultipleSymbols: true,
            category: '_types',
            isCategoryNode: true,
            name: 'type',
          },
          {
            allowMultipleSymbols: true,
            category: '_mocks',
            isCategoryNode: true,
            name: 'mock',
          },
          {
            allowMultipleSymbols: true,
            category: '_configs',
            isCategoryNode: true,
            name: 'config',
          },
          { category: '_utils', name: 'util' },
          { category: '_stores', name: 'store' },
          { category: '_contexts', name: 'context' },
          { category: '_hooks', name: 'hook' },
          { category: '_components', name: 'component' },
          { category: '_layouts', name: 'layout' },
          { category: '_pages', name: 'page' },
          { category: '_routes', name: 'route' },
        ],
        rootFragments: [
          {
            path: 'src',
            rootNodes: [['main.css'], ['main.tsx']],
          },
        ],
        subGraphRoles: [{ name: 'spec' }],
      },
    ],
  },
} as const satisfies TFAFConfig;
