import { useEffect, useRef, useState } from 'react'
import type { ReactElement } from 'react'
import type { WealthPerson } from '@/api/snapshot'
import { money, number } from '@/features/journey/scale'
import { scoreGuess, guessCeiling, shuffledPeople } from './worlds'

export function WealthGame({
  people,
  asOf,
  onClose,
}: {
  people: WealthPerson[]
  asOf: string
  onClose: () => void
}): ReactElement {
  const dialog = useRef<HTMLDialogElement>(null)
  const [round, setRound] = useState(0)
  const [guess, setGuess] = useState(100e9)
  const [revealed, setRevealed] = useState(false)
  const [scores, setScores] = useState<number[]>([])
  const [rounds] = useState(() => shuffledPeople(people).slice(0, 5))
  const current = rounds[round]
  const maximum = guessCeiling(
    Math.max(1, ...people.map((person) => person.dollars)),
  )
  useEffect(() => {
    const node = dialog.current
    node?.showModal()
    return () => node?.close()
  }, [])
  return (
    <dialog
      ref={dialog}
      className="wealth-dialog"
      aria-labelledby="game-title"
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="game-body">
        <button
          className="dialog-close"
          onClick={onClose}
          aria-label="Close game"
        >
          ×
        </button>
        <span className="small-label">A LITTLE GUESSWORK</span>
        <h2 id="game-title">Guess the fortune.</h2>
        {!current ? (
          <>
            <p>
              {rounds.length
                ? `Your average score: ${number(scores.reduce((sum, value) => sum + value, 0) / scores.length)} / 100`
                : 'No dated fortunes are available yet.'}
            </p>
            <button className="primary-button" onClick={onClose}>
              Back to exploring
            </button>
          </>
        ) : (
          <>
            <p className="input-help">
              Round {round + 1} of {rounds.length} · Estimates as of {asOf}
            </p>
            <h3>{current.name}</h3>
            <p>{current.industry}</p>
            <label htmlFor="wealth-guess">
              Your estimate: <strong>{money(guess)}</strong>
            </label>
            <input
              id="wealth-guess"
              type="range"
              min={1e9}
              max={maximum}
              step={1e9}
              value={guess}
              disabled={revealed}
              onChange={(event) => setGuess(Number(event.target.value))}
            />
            <div className="game-range">
              <span>$1B</span>
              <span>{money(maximum)}</span>
            </div>
            {revealed ? (
              <div role="status">
                <p>
                  The estimate is <strong>{money(current.dollars)}</strong>.
                </p>
                <p>
                  {scoreGuess(guess, current.dollars)} / 100 · Your guess was{' '}
                  {number(guess / current.dollars)} × the estimate.
                </p>
                <button
                  className="primary-button"
                  onClick={() => {
                    setRound((value) => value + 1)
                    setRevealed(false)
                    setGuess(100e9)
                  }}
                >
                  {round + 1 === rounds.length
                    ? 'See your score'
                    : 'Next fortune'}
                </button>
              </div>
            ) : (
              <button
                className="primary-button"
                onClick={() => {
                  setScores((values) => [
                    ...values,
                    scoreGuess(guess, current.dollars),
                  ])
                  setRevealed(true)
                }}
              >
                Reveal the answer
              </button>
            )}
            <p className="input-help">
              Score = smaller amount ÷ larger amount × 100. Guessing twice or
              half the estimate earns 50 points.
            </p>
          </>
        )}
      </div>
    </dialog>
  )
}
