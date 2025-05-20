module.exports = {
  entryPoints: ['./src'],
  out: 'docs',
  exclude: ['**/node_modules/**', '**/*.spec.ts', '**/*.test.ts', '**/dist/**'],
  name: 'Player Piano Documentation',
  includeVersion: true,
  readme: 'README.md',
  categoryOrder: [
    'Server',
    'Client',
    'Shared',
    '*'
  ]
};