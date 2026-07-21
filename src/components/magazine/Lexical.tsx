import React from "react";
import {
  slugify,
  nodeText,
  type LexicalDoc,
  type LexicalNode,
  type LexicalText,
} from "@/lib/magazine";

// ---------------------------------------------------------------------------
// Rendu HTML sémantique du JSON Lexical de Payload (§4.3 : pas de PDF
// encapsulé — du vrai HTML indexable, accessible et cherchable).
// ---------------------------------------------------------------------------

const FORMAT_BOLD = 1;
const FORMAT_ITALIC = 2;
const FORMAT_UNDERLINE = 8;

function renderText(node: LexicalText, key: number) {
  let el: React.ReactNode = node.text;
  const format = node.format ?? 0;
  if (format & FORMAT_BOLD) el = <strong key={key}>{el}</strong>;
  if (format & FORMAT_ITALIC) el = <em key={key}>{el}</em>;
  if (format & FORMAT_UNDERLINE) el = <u key={key}>{el}</u>;
  return <React.Fragment key={key}>{el}</React.Fragment>;
}

function renderChildren(node: LexicalNode): React.ReactNode {
  return (node.children ?? []).map((child, i) =>
    "text" in child && typeof (child as LexicalText).text === "string"
      ? renderText(child as LexicalText, i)
      : renderNode(child as LexicalNode, i)
  );
}

function renderNode(node: LexicalNode, key: number): React.ReactNode {
  switch (node.type) {
    case "heading": {
      const text = nodeText(node);
      const Tag = (node.tag as "h2" | "h3" | "h4") || "h2";
      return (
        <Tag key={key} id={Tag === "h2" ? slugify(text) : undefined}>
          {renderChildren(node)}
        </Tag>
      );
    }
    case "paragraph":
      return <p key={key}>{renderChildren(node)}</p>;
    case "quote":
      return <blockquote key={key}>{renderChildren(node)}</blockquote>;
    case "list": {
      const Tag = node.listType === "number" ? "ol" : "ul";
      return <Tag key={key}>{renderChildren(node)}</Tag>;
    }
    case "listitem":
      return <li key={key}>{renderChildren(node)}</li>;
    case "link":
    case "autolink":
      return (
        <a
          key={key}
          href={node.fields?.url ?? "#"}
          target={node.fields?.newTab ? "_blank" : undefined}
          rel="noopener noreferrer"
        >
          {renderChildren(node)}
        </a>
      );
    case "horizontalrule":
      return <hr key={key} />;
    case "linebreak":
      return <br key={key} />;
    default:
      // Type inconnu → on rend le texte pour ne jamais perdre de contenu.
      return <p key={key}>{renderChildren(node)}</p>;
  }
}

export default function Lexical({ doc }: { doc: LexicalDoc | null | undefined }) {
  if (!doc?.root?.children) return null;
  return <>{(doc.root.children as LexicalNode[]).map((n, i) => renderNode(n, i))}</>;
}
