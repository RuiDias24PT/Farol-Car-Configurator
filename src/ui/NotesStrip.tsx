import { formatNote } from '@/i18n'
import { useT } from '@/i18n/useT'
import { useDispatch, useNotes } from '@/state/useStore'

import './NotesStrip.css'

interface NotesStripProps {
  /** Called after dismissing. The button that had focus is about to unmount,
   *  and focus left on a removed node falls back to <body> — the next Tab
   *  would restart from the top of the page. */
  onDismissed?: () => void
}

export function NotesStrip({ onDismissed }: NotesStripProps) {
  const notes = useNotes()
  const dispatch = useDispatch()
  const t = useT()

  return (
    // The live region is always mounted and only its contents change: screen
    // readers announce changes to a region they already know about, and often
    // miss one that appears already filled.
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
