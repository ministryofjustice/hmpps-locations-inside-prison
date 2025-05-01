import hmppsConfig from '@ministryofjustice/eslint-config-hmpps'

const config = hmppsConfig()

config.push({
  name: 'jquery',
  files: [`assets/js/**/*.js`],
  languageOptions: {
    globals: {
      $: true,
      module: true,
    },
  },
})

config.push({
  name: 'allow-any-in-tests',
  files: [`**/*.test.ts`],
  rules: {
    '@typescript-eslint/no-explicit-any': 0,
  },
})

export default config
