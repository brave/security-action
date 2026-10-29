---
name: oss/gitlab.bandit.B506
rubric: safety
severity: should_fix
languages: [python]
---

**Rule.** The application was found using an unsafe version of `yaml` load which is vulnerable to deserialization attacks. Deserialization attacks exploit the process of reading serialized data and turning it back into an object. By constructing malicious objects and serializing them, an adversary may attempt to: - Inject code that is executed upon object construction, which occurs during the deserialization process. - Exploit mass assignment by including fields that are not normally a part of the serialized data but are read in during deserialization. To remediate this issue, use `safe_load()` or call `yaml.load()` with the `Loader` argument set to `yaml.SafeLoader`. Example loading YAML using `safe_load`: ``` import yaml # Use safe_load to load data into an intermediary object intermediary_object = yaml.safe_load("""user: name: 'test user'""" ) # Create our real object, copying over only the necessary fields user_object = {'user': { # Assign the deserialized data from intermediary object 'name': intermediary_object['user']['name'], # Add in protected data in object definition (or set it from a class constructor) 'is_admin': False, } } # Work with user_object # ... ``` For more details on deserialization attacks in general, see OWASP's guide: - https://cheatsheetseries.owasp.org/cheatsheets/Deserialization_Cheat_Sheet.html

**Why.** Reported as CWE-502. Ported from opengrep rule `gitlab.bandit.B506` (generated/oss/audit.yaml).

## Examples

Bad:

```python
yaml.unsafe_load(...)
yaml.$LD(..., Loader=yaml.$LOADER, ...)
yaml.$LD($DATA)
```

Good:

```python
from ruamel.yaml import YAML
...
```

## Detection hints

Literal patterns from opengrep rule `gitlab.bandit.B506` (metavariables start with `$`):

- `import yaml
...`
- `from ruamel.yaml import YAML
...`
- `yaml.unsafe_load(...)`
- `yaml.$LD(..., Loader=yaml.$LOADER, ...)`
- `yaml.$LD($DATA)`
- `(Loader|UnsafeLoader|CLoader|FullLoader)`
- `(load|load_all)`
