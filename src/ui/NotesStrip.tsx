import { formatNote } from '@/i18n'
import { useT } from '@/i18n/useT'
import { useDispatch, useNotes } from '@/state/useStore'

import './NotesStrip.css'

interface NotesStripProps {
  onDismissed?: () => void
}

export function NotesStrip({ onDismissed }: NotesStripProps) {
  const notes = useNotes()
  const dispatch = useDispatch()
  const t = useT()

  return (
    <div role="status">
      {notes.length > 0 && (
        <div className="notes">
          <ul>
            {notes.map((note, i) => (
              <li key={`${note.code}-${i}`}>{formatNote(t, note)}</li>
            ))}
          </ul>
          <button
            type="button"
            className="notes-close"
            aria-label={t.ui.dismiss}
            onClick={() => {
              dispatch({ type: 'dismissNotes' })
              onDismissed?.()
            }}
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>
      )}
    </div>
  )
}
