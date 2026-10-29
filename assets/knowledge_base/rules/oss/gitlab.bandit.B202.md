---
name: oss/gitlab.bandit.B202
rubric: safety
severity: should_fix
languages: [python]
---

**Rule.** The application may be vulnerable to a path traversal if it extracts untrusted archive files. This vulnerability is colloquially known as 'Zip Slip'. Archive files may contain folders which, when extracted, may write outside of the intended directory. This is exploited by including path traversal characters such as `../../other/directory` to overwrite or place files in system or application directories. Extra care must be taken when extracting archive files as there are numerous concerns: - If possible, generate unique filenames instead of using the archives file names, as it may be possible for users to overwrite files if the filenames are the same. - Validate file paths are written with a prefixed, known trusted directory. - Only process regular files and not symbolic links, as some applications may attempt to read/follow the symbolic link, leading to arbitrary file read / write vulnerabilities. Example of securely processing an archive file: ``` import tarfile import uuid # import os tar = tarfile.open('some.tar') # Max number of allowed files in our archive max_files = 10 # Max size for all files in archive max_size = 1024 * 1024 * 10 # 10MB # Max size per file in archive max_file_size = 1024 * 1024 # 1MB # Validate number of files in archive if len(tar.getmembers()) > max_files: raise Exception("Too many files in archive") total_size = 0 # Loop over all files to see if we exceed max size # if so, do not process any of them. for f in tar.getmembers(): total_size += f.size if total_size >= max_size: raise Exception("Archive files exceeded max file size") # Iterate over files now that we know the total size is within limits for f in tar.getmembers(): # Internally this calls TarInfo.isreg() which ensures # the file is a regular file and not a sym link or directory if not f.isfile(): continue # Optional, set a limit on each file size if f.size > max_file_size: raise Exception(f"File {f.name} too large: {f.size}") # If original names are required, ensure that only the # filename is used: # filename = os.path.basename(f.name) # More secure, generate a UUID4 value instead filename = uuid.uuid4().hex # Reset the archive filename to the basename # Newer versions of python (3.11.4+) should use: # new_tar = old_tar.replace(name=...new name...) f.name = filename # Extract the file into a restricted directory, with our # own user's attributes, not the file from the archive tar.extract(f, '/opt/app/restricted/', set_attrs=False) ``` For more information on tarfile see: - https://docs.python.org/3/library/tarfile.html

**Why.** Reported as CWE-22. Ported from opengrep rule `gitlab.bandit.B202` (generated/oss/audit.yaml).

## Examples

Bad:

```python
$TAR.extractall(...)
tarfile.extractall(..., members=$TAR)
$TAR.extractall(..., members=[])
tarfile.extractall(...)
tarfile.extractall(..., members=[])
```

## Detection hints

Literal patterns from opengrep rule `gitlab.bandit.B202` (metavariables start with `$`):

- `import tarfile
...`
- `$TAR = tarfile.open(...)
...`
- `$TAR.extractall(...)`
- `tarfile.extractall(..., members=$TAR)`
- `$TAR.extractall(..., members=[])`
- `tarfile.extractall(...)`
- `tarfile.extractall(..., members=[])`
