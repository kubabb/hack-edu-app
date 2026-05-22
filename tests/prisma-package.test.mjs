import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

function major(versionRange) {
  const match = versionRange.match(/\d+/)
  return match ? Number(match[0]) : null
}

test('Prisma CLI and Prisma Client use the same major version', async () => {
  const packageJson = JSON.parse(
    await readFile(new URL('../package.json', import.meta.url), 'utf8')
  )

  assert.equal(
    major(packageJson.devDependencies.prisma),
    major(packageJson.dependencies['@prisma/client'])
  )
})
