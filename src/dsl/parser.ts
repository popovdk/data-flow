import peggy from "peggy";

import type { AstDiagram, Diagnostic } from "./types";

const grammar = String.raw`
{
  function loc() {
    const info = location();
    return { line: info.start.line, column: info.start.column, offset: info.start.offset };
  }
}

Diagram
  = _ items:(Statement _)* {
      const nodes = [];
      const groups = [];
      const connections = [];
      for (const item of items) {
        const stmt = item[0];
        if (stmt.type === "node") {
          nodes.push(stmt);
        } else if (stmt.type === "group") {
          groups.push(stmt);
          nodes.push(...stmt.nodes);
        } else {
          connections.push(stmt);
        }
      }
      return { nodes, groups, connections };
    }

Statement = Group / Node / Connection

Group
  = "group" __ id:Identifier _ label:Label? _ "{" _ nodes:GroupNodeList? _ "}" {
      return { type: "group", id, label, nodes: nodes ?? [], loc: loc() };
    }

GroupNodeList
  = first:Node rest:(_ Node)* {
      return [first, ...rest.map((item) => item[1])];
    }

Node
  = "node" __ id:Identifier _ label:Label? _ "{" _ fields:FieldList? _ "}" {
      return { type: "node", id, label, fields: fields ?? [], loc: loc() };
    }

FieldList
  = first:Field rest:(_ Field)* {
      return [first, ...rest.map((item) => item[1])];
    }

Field
  = name:Identifier _ ":" _ type:Type {
      return { type: "field", name, fieldType: type, loc: loc() };
    }
  / name:Identifier _ nested:NestedFields {
      return { type: "field", name, children: nested, loc: loc() };
    }

NestedFields
  = "{" _ fields:FieldList? _ "}" { return fields ?? []; }

Connection
  = source:FieldPath _ "->" _ target:FieldPath {
      return { type: "connection", source, target, loc: loc() };
    }

FieldPath
  = node:Identifier "." path:Path {
      return { nodeId: node, path, loc: loc() };
    }

Path
  = head:Identifier tail:("." Identifier)* {
      return [head, ...tail.map((item) => item[1])].join(".");
    }

Label
  = "[" _ "label" _ "=" _ value:String _ "]" { return value; }

Identifier = $([a-zA-Z_][a-zA-Z0-9_]*)
Type = $([a-zA-Z_][a-zA-Z0-9_<>\[\]]*)
String = '"' chars:$([^"]*) '"' { return chars; }

_ = (Whitespace / LineComment)*
__ = (Whitespace / LineComment)+
Whitespace = [ \t\n\r]+
LineComment = ("//" (!EndOfLine .)* EndOfLine?) / ("#" (!EndOfLine .)* EndOfLine?)
EndOfLine = "\r\n" / "\n" / "\r"
`;

const parser = peggy.generate(grammar, { grammarSource: "dsl.pegjs" });

export function parseDsl(input: string): {
  diagram: AstDiagram | null;
  diagnostics: Diagnostic[];
} {
  try {
    const diagram = parser.parse(input) as AstDiagram;
    return { diagram, diagnostics: [] };
  } catch (error) {
    const diagnostics: Diagnostic[] = [];
    const maybeError = error as {
      message?: string;
      location?: { start: { line: number; column: number } };
    };
    if (maybeError?.location?.start) {
      diagnostics.push({
        message: maybeError.message ?? "Syntax error",
        line: maybeError.location.start.line,
        column: maybeError.location.start.column,
        severity: "error",
      });
    } else {
      diagnostics.push({
        message: "Syntax error",
        line: 1,
        column: 1,
        severity: "error",
      });
    }
    return { diagram: null, diagnostics };
  }
}
