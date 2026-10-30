---
name: oss/gitlab.eslint.detect-non-literal-fs-filename
rubric: safety
severity: should_fix
languages: [typescript, javascript]
cwe: [CWE-22]
---

**Rule.** The application dynamically constructs file or path information. If the path information comes from user-supplied input, it could be abused to read sensitive files, access other users' data, or aid in exploitation to gain further system access. User input should never be used in constructing paths or files for interacting with the filesystem. This includes filenames supplied by user uploads or downloads. If possible, consider hashing user input or using unique values and use `path.normalize` to resolve and validate the path information prior to processing any file functionality. Example using `path.normalize` and not allowing direct user input: ``` // User input, saved only as a reference // id is a randomly generated UUID to be used as the filename const userData = {userFilename: userSuppliedFilename, id: crypto.randomUUID()}; // Restrict all file processing to this directory only const basePath = '/app/restricted/'; // Create the full path, but only use our random generated id as the filename const joinedPath = path.join(basePath, userData.id); // Normalize path, removing any '..' const fullPath = path.normalize(joinedPath); // Verify the fullPath is contained within our basePath if (!fullPath.startsWith(basePath)) { console.log("Invalid path specified!"); } // Process / work with file // ... ``` For more information on path traversal issues see OWASP: https://owasp.org/www-community/attacks/Path_Traversal

**Why.** Reported as CWE-22. Ported from opengrep rule `gitlab.eslint.detect-non-literal-fs-filename` (generated/oss/security_noaudit_novuln.yaml).

## Examples

Bad:

```text
$MOD.appendFile(...)
$MOD.appendFileSync(...)
$MOD.chmod(...)
$MOD.chmodSync(...)
$MOD.chown(...)
$MOD.chownSync(...)
$MOD.createReadStream(...)
$MOD.createWriteStream(...)
$MOD.exists(...)
$MOD.existsSync(...)
$MOD.lchmod(...)
$MOD.lchmodSync(...)
$MOD.lchown(...)
$MOD.lchownSync(...)
$MOD.link(...)
$MOD.linkSync(...)
$MOD.lstat(...)
$MOD.lstatSync(...)
$MOD.mkdir(...)
$MOD.mkdirSync(...)
$MOD.open(...)
$MOD.openSync(...)
$MOD.readdir(...)
$MOD.readdirSync(...)
$MOD.readFile(...)
$MOD.readFileSync(...)
$MOD.readlink(...)
$MOD.readlinkSync(...)
$MOD.realpath(...)
$MOD.realpathSync(...)
$MOD.rename(...)
$MOD.renameSync(...)
$MOD.rmdir(...)
$MOD.rmdirSync(...)
$MOD.stat(...)
$MOD.statSync(...)
$MOD.symlink(...)
$MOD.symlinkSync(...)
$MOD.truncate(...)
$MOD.truncateSync(...)
$MOD.unlink(...)
$MOD.unlinkSync(...)
$MOD.unwatchFile(...)
$MOD.utimes(...)
$MOD.utimesSync(...)
$MOD.watch(...)
$MOD.watchFile(...)
$MOD.writeFile(...)
$MOD.writeFileSync(...)
```

Good:

```text
$MOD.appendFile("...", ...)
$MOD.appendFileSync("...", ...)
$MOD.chmod("...", ...)
$MOD.chmodSync("...", ...)
$MOD.chown("...", ...)
$MOD.chownSync("...", ...)
$MOD.createReadStream("...", ...)
$MOD.createWriteStream("...", ...)
$MOD.exists("...", ...)
$MOD.existsSync("...", ...)
$MOD.lchmod("...", ...)
$MOD.lchmodSync("...", ...)
$MOD.lchown("...", ...)
$MOD.lchownSync("...", ...)
$MOD.link("...", "...", ...)
$MOD.linkSync("...", "...", ...)
$MOD.lstat("...", ...)
$MOD.lstatSync("...", ...)
$MOD.mkdir("...", ...)
$MOD.mkdirSync("...", ...)
$MOD.open("...", ...)
$MOD.openSync("...", ...)
$MOD.readdir("...", ...)
$MOD.readdirSync("...", ...)
$MOD.readFile("...", ...)
$MOD.readFileSync("...", ...)
$MOD.readlink("...", ...)
$MOD.readlinkSync("...", ...)
$MOD.realpath("...", ...)
$MOD.realpathSync("...", ...)
$MOD.rename("...", "...", ...)
$MOD.renameSync("...", "...", ...)
$MOD.rmdir("...", ...)
$MOD.rmdirSync("...", ...)
$MOD.stat("...", ...)
$MOD.statSync("...", ...)
$MOD.symlink("...", "...", ...)
$MOD.symlinkSync("...", "...", ...)
$MOD.truncate("...", ...)
$MOD.truncateSync("...", ...)
$MOD.unlink("...", ...)
$MOD.unlinkSync("...", ...)
$MOD.unwatchFile("...", ...)
$MOD.utimes("...", ...)
$MOD.utimesSync("...", ...)
$MOD.watch("...", ...)
$MOD.watchFile("...", ...)
$MOD.writeFile("...", ...)
$MOD.writeFileSync("...", ...)
```

## Detection hints

Literal patterns from opengrep rule `gitlab.eslint.detect-non-literal-fs-filename` (metavariables start with `$`):

- `import $MOD from $IMP
...`
- `$MOD = require($IMP)
...`
- `$MOD.appendFile("...", ...)`
- `$MOD.appendFileSync("...", ...)`
- `$MOD.chmod("...", ...)`
- `$MOD.chmodSync("...", ...)`
- `$MOD.chown("...", ...)`
- `$MOD.chownSync("...", ...)`
- `$MOD.createReadStream("...", ...)`
- `$MOD.createWriteStream("...", ...)`
- `$MOD.exists("...", ...)`
- `$MOD.existsSync("...", ...)`
- `$MOD.lchmod("...", ...)`
- `$MOD.lchmodSync("...", ...)`
- `$MOD.lchown("...", ...)`
- `$MOD.lchownSync("...", ...)`
- `$MOD.link("...", "...", ...)`
- `$MOD.linkSync("...", "...", ...)`
- `$MOD.lstat("...", ...)`
- `$MOD.lstatSync("...", ...)`
- `$MOD.mkdir("...", ...)`
- `$MOD.mkdirSync("...", ...)`
- `$MOD.open("...", ...)`
- `$MOD.openSync("...", ...)`
- `$MOD.readdir("...", ...)`
- `$MOD.readdirSync("...", ...)`
- `$MOD.readFile("...", ...)`
- `$MOD.readFileSync("...", ...)`
- `$MOD.readlink("...", ...)`
- `$MOD.readlinkSync("...", ...)`
- `$MOD.realpath("...", ...)`
- `$MOD.realpathSync("...", ...)`
- `$MOD.rename("...", "...", ...)`
- `$MOD.renameSync("...", "...", ...)`
- `$MOD.rmdir("...", ...)`
- `$MOD.rmdirSync("...", ...)`
- `$MOD.stat("...", ...)`
- `$MOD.statSync("...", ...)`
- `$MOD.symlink("...", "...", ...)`
- `$MOD.symlinkSync("...", "...", ...)`
- `$MOD.truncate("...", ...)`
- `$MOD.truncateSync("...", ...)`
- `$MOD.unlink("...", ...)`
- `$MOD.unlinkSync("...", ...)`
- `$MOD.unwatchFile("...", ...)`
- `$MOD.utimes("...", ...)`
- `$MOD.utimesSync("...", ...)`
- `$MOD.watch("...", ...)`
- `$MOD.watchFile("...", ...)`
- `$MOD.writeFile("...", ...)`
- `$MOD.writeFileSync("...", ...)`
- `$MOD.appendFile(...)`
- `$MOD.appendFileSync(...)`
- `$MOD.chmod(...)`
- `$MOD.chmodSync(...)`
- `$MOD.chown(...)`
- `$MOD.chownSync(...)`
- `$MOD.createReadStream(...)`
- `$MOD.createWriteStream(...)`
- `$MOD.exists(...)`
- `$MOD.existsSync(...)`
- `$MOD.lchmod(...)`
- `$MOD.lchmodSync(...)`
- `$MOD.lchown(...)`
- `$MOD.lchownSync(...)`
- `$MOD.link(...)`
- `$MOD.linkSync(...)`
- `$MOD.lstat(...)`
- `$MOD.lstatSync(...)`
- `$MOD.mkdir(...)`
- `$MOD.mkdirSync(...)`
- `$MOD.open(...)`
- `$MOD.openSync(...)`
- `$MOD.readdir(...)`
- `$MOD.readdirSync(...)`
- `$MOD.readFile(...)`
- `$MOD.readFileSync(...)`
- `$MOD.readlink(...)`
- `$MOD.readlinkSync(...)`
- `$MOD.realpath(...)`
- `$MOD.realpathSync(...)`
- `$MOD.rename(...)`
- `$MOD.renameSync(...)`
- `$MOD.rmdir(...)`
- `$MOD.rmdirSync(...)`
- `$MOD.stat(...)`
- `$MOD.statSync(...)`
- `$MOD.symlink(...)`
- `$MOD.symlinkSync(...)`
- `$MOD.truncate(...)`
- `$MOD.truncateSync(...)`
- `$MOD.unlink(...)`
- `$MOD.unlinkSync(...)`
- `$MOD.unwatchFile(...)`
- `$MOD.utimes(...)`
- `$MOD.utimesSync(...)`
- `$MOD.watch(...)`
- `$MOD.watchFile(...)`
- `$MOD.writeFile(...)`
- `$MOD.writeFileSync(...)`
