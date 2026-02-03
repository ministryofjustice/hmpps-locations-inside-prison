import { configureAllowedScripts } from '@ministryofjustice/hmpps-npm-script-allowlist'

export default configureAllowedScripts({
  allowlist: {
    // cypress is used for integration tests
    'node_modules/cypress@14.5.4': 'ALLOW',
    // Provides native integration, supporting the ability to write dtrace probes for bunyan
    'node_modules/dtrace-provider@0.8.8': 'ALLOW',
    // ESBuild is written in GoLang - this is needed to download prebuilt binaries for the specific platform
    'node_modules/esbuild@0.27.2': 'ALLOW',
    'node_modules/tsx/node_modules/esbuild@0.25.12': 'ALLOW',
    // Needed by jest for running tests in watch mode
    'node_modules/fsevents@2.3.3': 'ALLOW',
    // Needed by esbuild for watching files during development
    'node_modules/@parcel/watcher@2.5.1': 'ALLOW',
    // Native solution to quickly resolve module paths, used by jest and eslint
    'node_modules/unrs-resolver@1.11.1': 'ALLOW',
  },
})
