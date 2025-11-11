'use client'

import {
	BlockquotePlugin,
	BoldPlugin,
	H1Plugin, H2Plugin, H3Plugin,
	ItalicPlugin,
	UnderlinePlugin,
} from '@platejs/basic-nodes/react'
import type { Value } from 'platejs'
import { Plate, usePlateEditor } from 'platejs/react'
import * as React from 'react'

import { BlockquoteElement } from '@/components/ui/blockquote-node'
import { Editor, EditorContainer } from '@/components/ui/editor'
import { H1Element, H2Element, H3Element } from '@/components/ui/heading-node'

const PLATE_ID = 'chapter-editor'

const EMPTY_VALUE: Value = [
  {
    type: 'p',
    children: [{ text: '' }],
  },
]

type MarkKey = 'bold' | 'italic' | 'underline'
type BlockKey = 'h1' | 'h2' | 'h3' | 'blockquote'

interface PlateEditorProps {
  value: any[]
  onChange: (value: any[]) => void
  readOnly?: boolean
}

const toolbarButtonBaseClass =
  'inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 bg-white text-sm font-medium text-gray-700 transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'

function BlockButton({
  block,
  label,
  tooltip,
  editor,
}: {
  block: BlockKey
  label: React.ReactNode
  tooltip: string
  editor: ReturnType<typeof usePlateEditor>
}) {
  const currentBlock = editor?.api?.block?.({ above: true })?.[0] as any
  const isActive = currentBlock?.type === block

  return (
    <button
      type="button"
      title={tooltip}
      aria-label={tooltip}
      aria-pressed={isActive}
      className={`${toolbarButtonBaseClass} ${isActive ? 'border-primary text-primary bg-primary-50' : ''}`}
      onMouseDown={(event) => {
        event.preventDefault()
        editor?.tf?.[block]?.toggle?.()
      }}
    >
      {label}
    </button>
  )
}

function MarkButton({
  mark,
  label,
  tooltip,
  editor,
}: {
  mark: MarkKey
  label: React.ReactNode
  tooltip: string
  editor: ReturnType<typeof usePlateEditor>
}) {
  const isActive = !!editor?.api?.mark?.(mark)

  return (
    <button
      type="button"
      title={tooltip}
      aria-label={tooltip}
      aria-pressed={isActive}
      className={`${toolbarButtonBaseClass} ${isActive ? 'border-primary text-primary bg-primary-50' : ''}`}
      onMouseDown={(event) => {
        event.preventDefault()
        editor?.tf?.[mark]?.toggle?.()
      }}
    >
      {label}
    </button>
  )
}

function FixedToolbar({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 rounded-t-lg border border-gray-200 bg-gray-50 px-3 py-2">
      {children}
    </div>
  )
}

export default function PlateEditor({
  value,
  onChange,
  readOnly = false,
}: PlateEditorProps) {
  const [, forceRerender] = React.useReducer((x) => x + 1, 0)
  const editor = usePlateEditor(
    React.useMemo(
      () => ({
        id: PLATE_ID,
        plugins: [
          // blocks
          H1Plugin.withComponent(H1Element),
          H2Plugin.withComponent(H2Element),
          H3Plugin.withComponent(H3Element),
          BlockquotePlugin.withComponent(BlockquoteElement),
          // marks
          BoldPlugin,
          ItalicPlugin,
          UnderlinePlugin,
        ],
        readOnly,
        value: (value && value.length > 0 ? value : EMPTY_VALUE) as Value,
      }),
      [value, readOnly],
    ),
  )

  const handleChange = React.useCallback(
    ({ value: nextValue }: { value: Value }) => {
      forceRerender()
      if (!readOnly) {
        onChange(nextValue as any[])
      }
    },
    [onChange, readOnly],
  )

  if (!editor) {
    return null
  }

  return (
    <Plate editor={editor} onChange={handleChange} readOnly={readOnly}>
      {!readOnly && (
        <FixedToolbar>
          <BlockButton
            block="h1"
            label={<span>H1</span>}
            tooltip="Heading 1"
            editor={editor}
          />
          <BlockButton
            block="h2"
            label={<span>H2</span>}
            tooltip="Heading 2"
            editor={editor}
          />
          <BlockButton
            block="h3"
            label={<span>H3</span>}
            tooltip="Heading 3"
            editor={editor}
          />
          <BlockButton
            block="blockquote"
            label={<span>&ldquo; &rdquo;</span>}
            tooltip="Blockquote"
            editor={editor}
          />
          <MarkButton
            mark="bold"
            label={<strong>B</strong>}
            tooltip="Bold (⌘+B)"
            editor={editor}
          />
          <MarkButton
            mark="italic"
            label={<em>I</em>}
            tooltip="Italic (⌘+I)"
            editor={editor}
          />
          <MarkButton
            mark="underline"
            label={<span className="underline">U</span>}
            tooltip="Underline (⌘+U)"
            editor={editor}
          />
        </FixedToolbar>
      )}
      <EditorContainer className="rounded-b-lg border border-gray-200">
        <Editor
          variant="chapter"
          readOnly={readOnly}
          
        />
      </EditorContainer>
    </Plate>
  )
}

