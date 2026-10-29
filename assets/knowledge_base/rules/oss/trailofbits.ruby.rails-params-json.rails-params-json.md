---
name: oss/trailofbits.ruby.rails-params-json.rails-params-json
rubric: safety
severity: should_fix
languages: [ruby]
---

**Rule.** Found Rails parameters (`params`) using the `_json` parameter. This parameter is subject to parser juggling. This may allow an attacker to exploit differences in parameter processing at different points in the request processing lifecycle. For example, object ID processing during the authentication/authorization phase and action execution phase.

**Why.** Reported as CWE-843: Access of Resource Using Incompatible Type ('Type Confusion'). See https://nastystereo.com/security/rails-_json-juggling-attack.html. See https://api.rubyonrails.org/v5.1.7/classes/ActionDispatch/Http/Parameters.html. See https://api.rubyonrails.org/classes/ActionController/Parameters.html. Ported from opengrep rule `trailofbits.ruby.rails-params-json.rails-params-json` (generated/oss/audit.yaml).

## Examples

Bad:

```text
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `trailofbits.ruby.rails-params-json.rails-params-json` (metavariables start with `$`):

- `params[:_json]`
- `params['_json']`
- `params.require(:_json)`
- `params.require('_json')`
- `params.fetch(:_json, ...)`
- `params.fetch('_json', ...)`
- `params.dig(:_json, ...)`
- `params.dig('_json', ...)`
