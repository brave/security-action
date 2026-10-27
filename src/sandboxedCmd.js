// Builds a shell command that runs `cmd` inside the Landlock wrapper.
//
// The action tree is mounted read-only (git metadata writable so local git
// operations can update refs/worktrees), listed dirs get read or write+exec
// rights, and egress stays denied unless `egress` opens TLS 443. The payload
// is always wrapped in `bash -c` with POSIX single-quote escaping so shell
// syntax (cd, pipes, redirects) survives the wrapper hop.
export default function buildSandboxedCmd ({
  actionPath,
  cmd,
  writeDirs = [],
  readDirs = [],
  egress = false
}) {
  const grants = [
    `bash ${actionPath}/scripts/with-sandbox.sh`,
    '--ignore-missing',
    // read-only action tree, but git metadata writable (refs, worktrees)
    `--ro "${actionPath}"`,
    `--rwx "${actionPath}/.git"`
  ]
  for (const dir of readDirs) grants.push(`--ro "${dir}"`)
  for (const dir of writeDirs) grants.push(`--rwx "${dir}"`)
  // actions/checkout writes a git credential include into $RUNNER_TEMP and
  // links it from .git/config; sandboxed git ops on the checkout die with
  // "fatal: bad config line" when the include is unreadable.
  if (process.env.RUNNER_TEMP) grants.push(`--ro "${process.env.RUNNER_TEMP}"`)
  grants.push(
    // git opens /dev/null O_RDWR for its pager plumbing.
    '--rw /dev/null',
    '--rox /usr',
    '--rox /lib',
    '--rox /lib64',
    '--ro /etc',
    // /run: the runner resolv.conf is a symlink into /run/systemd/resolve;
    // DNS fails without a read grant there.
    '--ro /run'
  )
  if (egress) grants.push('--connect-tcp 443')
  const payload = `bash -c '${cmd.replace(/'/g, '\'\\\'\'')}'`
  grants.push('--', payload)
  return grants.join(' ')
}
