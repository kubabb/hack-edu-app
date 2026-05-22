import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

test('Prisma Client includes the Windows query engine for local POST routes', async () => {
  const schema = await readFile(new URL('../prisma/schema.prisma', import.meta.url), 'utf8')

  assert.match(schema, /binaryTargets\s*=\s*\[[^\]]*"windows"[^\]]*\]/)
})
