'use client'

import { useState } from 'react'
import { AeroButton } from '@/components/ui/AeroButton'
import { AeroInput } from '@/components/ui/AeroInput'

interface ConfigRow {
  id: string
  key: string
  value: unknown
  description: string | null
}

interface GameConfigEditorProps {
  configs: ConfigRow[]
  onAdd: (key: string, value: unknown, description: string) => Promise<void>
  onUpdate: (id: string, value: unknown, description: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

function ConfigRowEditor({
  config,
  onUpdate,
  onDelete,
}: {
  config: ConfigRow
  onUpdate: (id: string, value: unknown, description: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
}) {
  const [value, setValue] = useState(JSON.stringify(config.value, null, 2))
  const [desc, setDesc] = useState(config.description ?? '')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleSave() {
    setSaving(true)
    try {
      const parsed = JSON.parse(value)
      await onUpdate(config.id, parsed, desc)
    } catch {
      // invalid JSON — save as string
      await onUpdate(config.id, value, desc)
    }
    setSaving(false)
  }

  async function handleDelete() {
    setDeleting(true)
    await onDelete(config.id)
    setDeleting(false)
  }

  return (
    <tr className="border-b border-aero-900/20">
      <td className="py-2 px-2 font-mono text-sm text-aero-400 align-top">{config.key}</td>
      <td className="py-2 px-2">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={2}
          className="aero-input w-full font-mono text-xs resize-y"
        />
      </td>
      <td className="py-2 px-2">
        <input
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          className="aero-input w-full text-xs"
          placeholder="Description..."
        />
      </td>
      <td className="py-2 px-2 text-right align-top space-x-1">
        <AeroButton variant="ghost" className="text-xs !py-1 !px-2" onClick={handleSave} loading={saving}>
          Save
        </AeroButton>
        <AeroButton variant="danger" className="text-xs !py-1 !px-2" onClick={handleDelete} loading={deleting}>
          Del
        </AeroButton>
      </td>
    </tr>
  )
}

export function GameConfigEditor({ configs, onAdd, onUpdate, onDelete }: GameConfigEditorProps) {
  const [newKey, setNewKey] = useState('')
  const [newValue, setNewValue] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [adding, setAdding] = useState(false)

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!newKey.trim()) return
    setAdding(true)
    try {
      const parsed = JSON.parse(newValue)
      await onAdd(newKey, parsed, newDesc)
    } catch {
      await onAdd(newKey, newValue, newDesc)
    }
    setNewKey('')
    setNewValue('')
    setNewDesc('')
    setAdding(false)
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleAdd} className="flex gap-2 items-end flex-wrap">
        <AeroInput label="Key" value={newKey} onChange={(e) => setNewKey(e.target.value)} placeholder="config_key" />
        <AeroInput label="Value (JSON)" value={newValue} onChange={(e) => setNewValue(e.target.value)} placeholder='"value" or {"k":"v"}' />
        <AeroInput label="Description" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Optional description" />
        <AeroButton type="submit" loading={adding} disabled={!newKey.trim()}>
          Add
        </AeroButton>
      </form>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-widest text-text-secondary border-b border-aero-900/40">
              <th className="text-left py-2 px-2">Key</th>
              <th className="text-left py-2 px-2">Value</th>
              <th className="text-left py-2 px-2">Description</th>
              <th className="text-right py-2 px-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {configs.map((c) => (
              <ConfigRowEditor key={c.id} config={c} onUpdate={onUpdate} onDelete={onDelete} />
            ))}
          </tbody>
        </table>
        {configs.length === 0 && (
          <p className="text-center py-4 text-text-muted text-sm">No config keys yet.</p>
        )}
      </div>
    </div>
  )
}
