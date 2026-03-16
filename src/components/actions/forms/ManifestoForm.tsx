'use client'

import { useState } from 'react'
import { DescriptionEditor } from '@/components/actions/fields/DescriptionEditor'

interface ActionFormProps {
  params: Record<string, any>
  onParamsChange: (params: Record<string, any>) => void
  targetLgas: string[]
  onTargetLgasChange: (lgas: string[]) => void
  targetAzs: string[]
  onTargetAzsChange: (azs: string[]) => void
  language: string
  onLanguageChange: (lang: string) => void
  description: string
  onDescriptionChange: (desc: string) => void
}

const ACCEPTED_TYPES = '.pdf,.docx,.doc'
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export function ManifestoForm({
  params,
  onParamsChange,
  description,
  onDescriptionChange,
}: ActionFormProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > MAX_FILE_SIZE) {
      setUploadError('File too large (max 10MB)')
      return
    }

    setUploading(true)
    setUploadError(null)

    try {
      // For now, store the file name — actual Supabase Storage upload
      // will be done on submission via the action submission handler
      const fileUrl = URL.createObjectURL(file)
      onParamsChange({
        ...params,
        file_url: fileUrl,
        file_name: file.name,
        _file: file, // Carried for upload on submit
      })
    } catch {
      setUploadError('Failed to process file')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded border border-aero-500/20 bg-aero-500/5 px-3 py-2 text-xs text-text-secondary">
        National scope. Required by Turn 1.
      </div>

      <div className="space-y-1">
        <label className="block text-xs uppercase tracking-widest text-text-secondary">
          Manifesto Document (PDF or DOCX)
        </label>
        <input
          type="file"
          accept={ACCEPTED_TYPES}
          onChange={handleFileChange}
          disabled={uploading}
          className="block w-full text-sm text-text-secondary file:mr-4 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:bg-aero-500/20 file:text-aero-300 hover:file:bg-aero-500/30 file:cursor-pointer"
        />
        {uploading && (
          <p className="text-xs text-text-muted animate-pulse">Processing...</p>
        )}
        {uploadError && (
          <p className="text-xs text-danger">{uploadError}</p>
        )}
        {params.file_name && !uploading && (
          <p className="text-xs text-green-400">
            Attached: {params.file_name}
          </p>
        )}
      </div>

      <DescriptionEditor
        value={description}
        onChange={onDescriptionChange}
        placeholder="Describe the manifesto — key themes, narrative framing, policy priorities..."
      />
    </div>
  )
}
