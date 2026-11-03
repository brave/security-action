/**
 * Phase A benchmark queue builder: deterministic labeled case queues from
 * the paper artifact datasets (OWASP Benchmark, Vul4J, OSS-Fuzz pool).
 *
 * All fs access is injected (listDir/readFile) so the queue can run on the
 * real artifact tree or on test fixtures.
 */

export function mulberry32 (seed) {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function seededShuffle (arr, rng) {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

function loadCases (dir, listDir, readFile) {
  return listDir(dir)
    .filter(f => f.endsWith('.json'))
    .sort()
    .map(f => JSON.parse(readFile(`${dir}/${f}`)))
}

const basename = (p) => String(p).replace(/\/+$/, '').split('/').pop()

/** "testname,category,real_vuln,cwe" CSV with '#' comment header. */
export function parseOwaspExpectedResults (csvText) {
  const map = {}
  for (const line of String(csvText).split('\n')) {
    const t = line.trim()
    if (!t || t.startsWith('#') || t.toLowerCase().startsWith('test name')) continue
    const [name, , , cwe] = t.split(',')
    if (name) map[name.trim()] = String(cwe ?? '').trim()
  }
  return map
}

/** "vul_id,cwe_id" CSV. */
export function parseVul4jDatasetCsv (csvText) {
  const map = {}
  for (const line of String(csvText).split('\n')) {
    const t = line.trim()
    if (!t || t.toLowerCase().startsWith('vul_id')) continue
    const [vulId, cweId] = t.split(',')
    if (vulId) map[vulId.trim()] = String(cweId ?? '').trim()
  }
  return map
}

export function parseOssfuzzLabels (jsonlText) {
  const map = {}
  for (const line of String(jsonlText).split('\n')) {
    const t = line.trim()
    if (!t) continue
    const row = JSON.parse(t)
    const cweTag = (row.rule_tags ?? []).find(tag => /cwe-(\d+)/i.test(tag))
    map[row.alert_id] = {
      label: row.human_ground_truth,
      cwe: cweTag ? /cwe-(\d+)/i.exec(cweTag)[1] : null
    }
  }
  return map
}

function loadOwasp ({ dir, label, repoRoot, expectedResults, listDir, readFile }) {
  return loadCases(dir, listDir, readFile).map(caseJson => ({
    caseId: caseJson.case_id,
    dataset: 'owasp',
    label,
    cwe: expectedResults[caseJson.case_id] ?? null,
    caseJson,
    repoRoot
  }))
}

function loadVul4j ({ caseDir, manifest, checkoutRoot, datasetCwe, listDir, readFile }) {
  const byCaseId = new Map(manifest.sampled_alerts.map(a => [a.case_id, a]))
  const items = []
  const skipped = []
  for (const caseJson of loadCases(caseDir, listDir, readFile)) {
    const entry = byCaseId.get(caseJson.case_id)
    if (!entry) {
      skipped.push(caseJson.case_id)
      continue
    }
    const vulId = entry.vul4j_id ?? basename(caseJson.folder_root)
    items.push({
      caseId: caseJson.case_id,
      dataset: 'vul4j',
      label: entry.ground_truth,
      cwe: datasetCwe[vulId] ?? null,
      caseJson,
      repoRoot: `${checkoutRoot.replace(/\/$/, '')}/${basename(caseJson.folder_root)}`
    })
  }
  return { items, skipped }
}

function loadOssfuzz ({ taskDir, labels, snapshotDir, listDir, readFile }) {
  const items = []
  for (const caseJson of loadCases(taskDir, listDir, readFile)) {
    if (caseJson.prompt_variant && caseJson.prompt_variant !== 'agent') continue
    const entry = labels[caseJson.alert_id ?? caseJson.case_id.replace(/__\w+$/, '')]
    if (!entry) continue
    items.push({
      caseId: caseJson.case_id,
      dataset: 'ossfuzz',
      label: entry.label,
      cwe: entry.cwe,
      caseJson,
      repoRoot: `${snapshotDir.replace(/\/$/, '')}/${basename(caseJson.folder_root)}`
    })
  }
  return { items, skipped: [] }
}

/**
 * Build the full Phase A queue. sampleFp/sampleTp subsample the OWASP FP and
 * TP pools (seeded); Vul4J and OSS-Fuzz run in full.
 */
export function buildQueue (args) {
  const {
    owaspFpDir, owaspTpDir, owaspRepoRoot, owaspExpectedResultsCsv,
    vul4jCaseDir, vul4jManifestPath, vul4jCheckoutRoot, vul4jDatasetCsv,
    ossfuzzTaskDir, ossfuzzLabelsPath, ossfuzzSnapshotDir,
    sampleFp = 0, sampleTp = 0, seed = 0,
    listDir, readFile
  } = args

  const items = []
  let skipped = []

  if (owaspFpDir || owaspTpDir) {
    const expectedResults = parseOwaspExpectedResults(readFile(owaspExpectedResultsCsv))
    const load = (dir, label) => dir
      ? loadOwasp({ dir, label, repoRoot: owaspRepoRoot, expectedResults, listDir, readFile })
      : []
    const fp = load(owaspFpDir, 'FP')
    const tp = load(owaspTpDir, 'TP')

    const rng = mulberry32(seed)
    const fpSample = sampleFp > 0 ? seededShuffle(fp, rng).slice(0, sampleFp) : fp
    const tpSample = sampleTp > 0 ? seededShuffle(tp, rng).slice(0, sampleTp) : tp
    items.push(...fpSample, ...tpSample)
  }

  if (vul4jCaseDir) {
    const datasetCwe = parseVul4jDatasetCsv(readFile(vul4jDatasetCsv))
    const vul = loadVul4j({ caseDir: vul4jCaseDir, manifest: JSON.parse(readFile(vul4jManifestPath)), checkoutRoot: vul4jCheckoutRoot, datasetCwe, listDir, readFile })
    items.push(...vul.items)
    skipped = vul.skipped
  }

  if (ossfuzzTaskDir) {
    const labels = parseOssfuzzLabels(readFile(ossfuzzLabelsPath))
    const oss = loadOssfuzz({ taskDir: ossfuzzTaskDir, labels, snapshotDir: ossfuzzSnapshotDir, listDir, readFile })
    items.push(...oss.items)
  }

  items.sort((a, b) => (a.dataset + a.caseId).localeCompare(b.dataset + b.caseId))

  return { items, skipped }
}
