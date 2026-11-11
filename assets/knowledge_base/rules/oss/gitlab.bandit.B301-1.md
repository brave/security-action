---
name: oss/gitlab.bandit.B301-1
rubric: safety
severity: should_fix
languages: [python]
cwe: [CWE-502]
---

**Rule.** The application was found using `pickle` which is vulnerable to deserialization attacks. Deserialization attacks exploit the process of reading serialized data and turning it back into an object. By constructing malicious objects and serializing them, an adversary may attempt to: - Inject code that is executed upon object construction, which occurs during the deserialization process. - Exploit mass assignment by including fields that are not normally a part of the serialized data but are read in during deserialization. Consider safer alternatives such as serializing data in the JSON format. Ensure any format chosen allows the application to specify exactly which object types are allowed to be deserialized. To protect against mass assignment, only allow deserialization of the specific fields that are required. If this is not easily done, consider creating an intermediary type that can be serialized with only the necessary fields exposed. Example JSON deserializer using an intermediary type that is validated against a schema to ensure it is safe from mass assignment: ``` import jsonschema # Create a schema to validate our user-supplied input against # an intermediary object intermediary_schema = { "type" : "object", "properties" : { "name": {"type" : "string"} }, "required": ["name"], # Protect against random properties being added to the object "additionalProperties": False, } # If a user attempted to add "'is_admin': True" it would cause a validation error intermediary_object = {'name': 'test user'} try: # Validate the user supplied intermediary object against our schema jsonschema.validate(instance=intermediary_object, schema=intermediary_schema) user_object = {'user': { # Assign the deserialized data from intermediary object 'name': intermediary_object['name'], # Add in protected data in object definition (or set it from a class constructor) 'is_admin': False, } } # Work with the user_object except jsonschema.exceptions.ValidationError as ex: # Gracefully handle validation errors # ... ``` For more details on deserialization attacks in general, see OWASP's guide: - https://cheatsheetseries.owasp.org/cheatsheets/Deserialization_Cheat_Sheet.html

**Why.** Reported as CWE-502. Ported from opengrep rule `gitlab.bandit.B301-1` (generated/oss/audit.yaml).

## Examples

Bad:

```python
pickle.$METHOD(...)
_pickle.$METHOD(...)
```

Good:

```python
pickle.$METHOD("...")
_pickle.$METHOD("...")
```

## Detection hints

Literal patterns from opengrep rule `gitlab.bandit.B301-1` (metavariables start with `$`):

- `pickle.$METHOD(...)`
- `pickle.$METHOD("...")`
- `_pickle.$METHOD(...)`
- `_pickle.$METHOD("...")`
- `(load|loads|Unpickler)`
