import type { Config } from 'jest'

const config: Config = {
  projects: [
    {
      displayName: 'node',
      preset: 'ts-jest',
      testEnvironment: 'node',
      testMatch: [
        '**/__tests__/markdown-to-html.test.ts',
        '**/__tests__/pdf.test.ts',
        '**/__tests__/format-helpers.test.ts',
      ],
      extensionsToTreatAsEsm: ['.ts'],
      moduleNameMapper: { '^(\\.{1,2}/.*)\\.js$': '$1' },
      transform: { '^.+\\.tsx?$': ['ts-jest', { useESM: true }] },
    },
    {
      displayName: 'jsdom',
      preset: 'ts-jest',
      testEnvironment: 'jsdom',
      testMatch: ['**/__tests__/style-settings.test.ts'],
      extensionsToTreatAsEsm: ['.ts'],
      moduleNameMapper: { '^(\\.{1,2}/.*)\\.js$': '$1' },
      transform: { '^.+\\.tsx?$': ['ts-jest', { useESM: true }] },
    },
  ],
}

export default config
