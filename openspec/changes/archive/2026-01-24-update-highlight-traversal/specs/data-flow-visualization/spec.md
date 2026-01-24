## MODIFIED Requirements
### Requirement: Optional full-path and reverse-path highlighting modes
The system SHALL support a default “simple” highlight mode that includes only direct (one-step) connections.

Optionally, the system MAY support:
- Forward full-path traversal: highlight the entire downstream chain following connection direction
- Reverse traversal: highlight upstream inputs in a distinct style

Full-path and reverse-path traversal MUST follow only explicit field-to-field connections defined in the DSL. The traversal MUST NOT infer connections between fields within the same node without an explicit DSL connection.

#### Scenario: Simple mode highlights only one step
- **WHEN** simple mode is active and a field is highlighted
- **THEN** only direct connections (one hop) are highlighted

#### Scenario: Full-path traversal follows only explicit connections
- **WHEN** full-path traversal is active and a field is highlighted
- **THEN** only fields reachable through explicit field-to-field connections are highlighted, and unrelated fields in the same node remain dim
