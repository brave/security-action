// Builds the shell command that runs `uv sync` inside the Landlock sandbox.
//
// uv sync installs packages from the PR-controlled uv.lock (and runs PEP 517
// build hooks for sdists), so it must run with a read-only workspace, a
// writable venv + uv caches and TLS-only egress. See README threat model.
export default function buildUvSyncCmd ({
  actionPath,
  cwd,
  home,
  groupArgs = '',
  // setup-uv overrides both locations on CI runners — grant what is real.
  uvCacheDir = `${home}/.cache/uv`,
  uvPythonDir = `${home}/.local/share/uv`
}) {
  // Landlock rules bind to paths that exist when the sandbox is built:
  // pre-create every writable directory (missing paths would be silently
  // dropped by --ignore-missing and their creation denied at runtime).
  return [
    `mkdir -p "${uvCacheDir}" "${uvPythonDir}" "${actionPath}/.venv"`,
    '&&',
    `bash ${actionPath}/scripts/with-sandbox.sh`,
    '--ignore-missing',
    `--ro "${cwd}"`,
    `--rox "${actionPath}"`,
    // rwx: uv execs the venv pythons it creates (and managed pythons).
    `--rwx "${actionPath}/.venv"`,
    `--rwx "${uvCacheDir}"`,
    `--rwx "${uvPythonDir}"`,
    // git (invoked for VCS sources) opens /dev/null O_RDWR.
    '--rw /dev/null',
    `--rox "${home}/.local/bin"`,
    '--rox /opt/hostedtoolcache',
    '--rox /usr',
    '--rox /lib',
    '--rox /lib64',
    '--ro /etc',
    // /run: the runner resolv.conf is a symlink into /run/systemd/resolve;
    // DNS fails without a read grant there.
    '--ro /run',
    '--connect-tcp 443',
    '--',
    `uv sync --frozen${groupArgs} --project ${actionPath}`
  ].join(' ')
}
