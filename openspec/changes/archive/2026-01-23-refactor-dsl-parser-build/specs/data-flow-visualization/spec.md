## ADDED Requirements
### Requirement: Standalone DSL grammar source
The DSL grammar SHALL be stored in a dedicated `.pegjs` file under `src/dsl/` and treated as the authoritative grammar definition.

#### Scenario: Editing the grammar
- **WHEN** a contributor updates the DSL grammar
- **THEN** the change is made in the standalone grammar file

### Requirement: Build-time parser generation
The build process SHALL generate an ESM parser module from the DSL grammar, and runtime parsing MUST import the generated parser without invoking `peggy.generate`.

#### Scenario: Building without runtime generation
- **WHEN** the application build runs
- **THEN** a generated parser module is produced and runtime parsing does not call `peggy.generate`
