'use client'

interface DiffLine {
  type: 'added' | 'removed' | 'unchanged'
  text: string
  oldNum: number | null
  newNum: number | null
}

function computeDiff(oldText: string, newText: string): DiffLine[] {
  const oldLines = oldText.split('\n')
  const newLines = newText.split('\n')
  const m = oldLines.length
  const n = newLines.length

  // LCS dynamic programming
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        oldLines[i - 1] === newLines[j - 1]
          ? dp[i - 1][j - 1] + 1
          : Math.max(dp[i - 1][j], dp[i][j - 1])
    }
  }

  // Backtrack
  const stack: DiffLine[] = []
  let i = m
  let j = n
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
      stack.push({ type: 'unchanged', text: oldLines[i - 1], oldNum: i, newNum: j })
      i--
      j--
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      stack.push({ type: 'added', text: newLines[j - 1], oldNum: null, newNum: j })
      j--
    } else {
      stack.push({ type: 'removed', text: oldLines[i - 1], oldNum: i, newNum: null })
      i--
    }
  }

  return stack.reverse()
}

interface WikiDiffProps {
  oldText: string
  newText: string
  oldLabel: string
  newLabel: string
}

export function WikiDiff({ oldText, newText, oldLabel, newLabel }: WikiDiffProps) {
  const lines = computeDiff(oldText, newText)

  return (
    <div className="wiki-diff-container">
      <div className="wiki-diff-header">
        <div style={{ color: '#b91c1c' }}>{oldLabel}</div>
        <div style={{ color: '#166534' }}>{newLabel}</div>
      </div>
      <div>
        {lines.map((line, i) => (
          <div
            key={i}
            className={`wiki-diff-line ${
              line.type === 'added'
                ? 'wiki-diff-added'
                : line.type === 'removed'
                  ? 'wiki-diff-removed'
                  : ''
            }`}
          >
            <div className="wiki-diff-line-num">
              {line.oldNum ?? ''}
            </div>
            <div className="wiki-diff-line-num">
              {line.newNum ?? ''}
            </div>
            <div className="wiki-diff-line-content">
              {line.type === 'added' && '+ '}
              {line.type === 'removed' && '- '}
              {line.type === 'unchanged' && '  '}
              {line.text}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
