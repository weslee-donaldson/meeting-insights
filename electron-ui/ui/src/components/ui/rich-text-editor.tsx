import React, { useCallback, useEffect } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer.js";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin.js";
import { ContentEditable } from "@lexical/react/LexicalContentEditable.js";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin.js";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin.js";
import { ListPlugin } from "@lexical/react/LexicalListPlugin.js";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary.js";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext.js";
import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";
import { ListItemNode, ListNode } from "@lexical/list";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import {
  $createParagraphNode,
  $getRoot,
  $isElementNode,
  $isDecoratorNode,
  FORMAT_TEXT_COMMAND,
  type EditorState,
  type LexicalEditor,
  type LexicalNode,
} from "lexical";
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from "@lexical/list";
import { Button } from "./button.js";
import { Bold, Italic, Underline, List, ListOrdered } from "lucide-react";

interface RichTextEditorProps {
  initialHtml: string;
  onChange: (html: string) => void;
}

const EDITOR_THEME = {
  text: {
    bold: "font-bold",
    italic: "italic",
    underline: "underline",
  },
  list: {
    nested: { listitem: "list-none" },
    ol: "list-decimal ml-4",
    ul: "list-disc ml-4",
    listitem: "ml-2",
  },
};

function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();

  const formatBold = useCallback(() => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
  }, [editor]);

  const formatItalic = useCallback(() => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
  }, [editor]);

  const formatUnderline = useCallback(() => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
  }, [editor]);

  const insertBulletList = useCallback(() => {
    editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
  }, [editor]);

  const insertOrderedList = useCallback(() => {
    editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
  }, [editor]);

  return (
    <div data-testid="rte-toolbar" className="flex gap-0.5 p-1 border-b border-border">
      <Button
        type="button"
        size="sm"
        variant="ghost"
        className="h-7 w-7 p-0"
        onClick={formatBold}
        aria-label="Bold"
      >
        <Bold className="w-3.5 h-3.5" />
      </Button>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        className="h-7 w-7 p-0"
        onClick={formatItalic}
        aria-label="Italic"
      >
        <Italic className="w-3.5 h-3.5" />
      </Button>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        className="h-7 w-7 p-0"
        onClick={formatUnderline}
        aria-label="Underline"
      >
        <Underline className="w-3.5 h-3.5" />
      </Button>
      <div className="w-px bg-border mx-0.5" />
      <Button
        type="button"
        size="sm"
        variant="ghost"
        className="h-7 w-7 p-0"
        onClick={insertBulletList}
        aria-label="Bullet list"
      >
        <List className="w-3.5 h-3.5" />
      </Button>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        className="h-7 w-7 p-0"
        onClick={insertOrderedList}
        aria-label="Ordered list"
      >
        <ListOrdered className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
}

function wrapInParagraphs(nodes: LexicalNode[]): LexicalNode[] {
  const result: LexicalNode[] = [];
  let pendingInline: LexicalNode[] = [];

  function flushInline() {
    if (pendingInline.length === 0) return;
    const p = $createParagraphNode();
    p.append(...pendingInline);
    result.push(p);
    pendingInline = [];
  }

  for (const node of nodes) {
    if ($isElementNode(node) || $isDecoratorNode(node)) {
      flushInline();
      result.push(node);
    } else {
      pendingInline.push(node);
    }
  }
  flushInline();
  return result;
}

function LoadInitialHtmlPlugin({ html }: { html: string }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!html) return;
    editor.update(() => {
      const parser = new DOMParser();
      const dom = parser.parseFromString(html, "text/html");
      const nodes = $generateNodesFromDOM(editor, dom);
      const wrapped = wrapInParagraphs(nodes);
      const root = $getRoot();
      root.clear();
      root.append(...wrapped);
    });
  }, []);

  return null;
}

function HtmlOnChangePlugin({ onChange }: { onChange: (html: string) => void }) {
  const [editor] = useLexicalComposerContext();

  const handleChange = useCallback(
    (_editorState: EditorState) => {
      editor.read(() => {
        const html = $generateHtmlFromNodes(editor, null);
        onChange(html);
      });
    },
    [editor, onChange],
  );

  return <OnChangePlugin onChange={handleChange} ignoreSelectionChange />;
}

export function RichTextEditor({ initialHtml, onChange }: RichTextEditorProps) {
  const initialConfig = {
    namespace: "InsightEditor",
    theme: EDITOR_THEME,
    nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode],
    onError: (error: Error) => {
      console.error("Lexical error:", error);
    },
  };

  return (
    <div data-testid="rich-text-editor" className="border border-border rounded-md bg-background">
      <LexicalComposer initialConfig={initialConfig}>
        <ToolbarPlugin />
        <RichTextPlugin
          contentEditable={
            <ContentEditable
              data-testid="rte-content"
              className="min-h-[120px] p-2 text-sm outline-none"
            />
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        <ListPlugin />
        <LoadInitialHtmlPlugin html={initialHtml} />
        <HtmlOnChangePlugin onChange={onChange} />
      </LexicalComposer>
    </div>
  );
}
