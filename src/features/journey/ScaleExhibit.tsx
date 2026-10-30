import { QualitySelect } from '@/features/shared/QualitySelect'
import { lazy, Suspense, useMemo, useState } from 'react'
import type { ReactElement } from 'react'
import { Box, Layers3, RotateCcw, ArrowUpRight, Download } from 'lucide-react'
import { useCapture } from '@/features/shared/useCapture'
import type { Quality } from '@/scene/lab/policy'
import { money, number } from './scale'
const ScaleStage = lazy(() => import('./ScaleStage'))
interface Props {
  step: number
  target: number
  unit: number
  predicted: boolean
  reference: number | null
  referenceKind: string
  personName?: string
  asOf?: string
  resetToken: number
}
function Illustration({ count }: { count: number }): ReactElement {
  return (
    <div
      className="illustrated-stage"
      role="img"
      aria-label={`${number(count)} value blocks, shown as a simplified illustration`}
    >
      <div className="illustrated-blocks">
        {Array.from({ length: Math.min(100, Math.ceil(count)) }, (_, index) => (
          <span key={index} />
        ))}
      </div>
      <p>
        {number(count)} {count === 1 ? 'block' : 'blocks'} · simplified
        illustration
      </p>
    </div>
  )
}
export function ScaleExhibit(props: Props): ReactElement {
  const [illustrated, setIllustrated] = useState(false)
  const [assembled, setAssembled] = useState<number | null>(null)
  const separated = assembled !== props.step && props.step >= 2
  const [reset, setReset] = useState(0)
  const [compare, setCompare] = useState(false)
  const [quality, setQuality] = useState<Quality>('standard')
  const invalid = props.step === 0 && props.reference === null
  const count = props.target / props.unit
  const hidden = props.step === 2 && !props.predicted
  const reference = compare && props.step > 0 ? props.reference : null
  const title =
    props.personName ??
    (props.step === 0
      ? 'YOUR STARTING POINT'
      : props.step === 3 && !props.personName
        ? 'ILLUSTRATIVE BENCHMARK'
        : props.step === 4
          ? 'HYPOTHETICAL BENCHMARK'
          : 'THE BIG PICTURE')
  const disclosure =
    props.step === 0
      ? `One reference cube. Introductory close-up; camera magnification adjusts continuously to keep your amount visible.`
      : props.target > 1e9
        ? `Overview; blocks regroup to ${money(props.unit)}. Pale anchors: $1M and $1B.`
        : `Volume equals value; pale anchor: $1M.`
  const captureInfo = useMemo(
    () => ({
      title: `${title} · ${money(props.target)}`,
      legend: `1 block = ${money(props.unit)} · ${disclosure}${reference ? ` · Gold reference: ${money(reference)} (${props.referenceKind})` : ''}`,
      source: props.asOf
        ? `Estimate as of ${props.asOf} · Forbes via RTB-API`
        : 'Illustrative benchmark · USD',
    }),
    [
      title,
      disclosure,
      props.target,
      props.unit,
      reference,
      props.referenceKind,
      props.asOf,
    ],
  )
  const { capture, registerCapture, saving, message, save } = useCapture()

  return (
    <section className="scale-exhibit" aria-label="Interactive scale exhibit">
      <div className="exhibit-topline">
        <span>
          <Box size={15} />
          THE SCALE LAB
        </span>
        <button
          className="view-toggle"
          aria-pressed={illustrated}
          onClick={() => setIllustrated(!illustrated)}
        >
          {illustrated ? 'Use 3D view' : 'Use illustrated view'}
        </button>
      </div>
      <div className="exhibit-amount">
        <span className="small-label">{title}</span>
        <strong>
          {props.step === 0 && props.reference === null
            ? 'Enter an amount'
            : money(props.target)}
        </strong>
        <span className="full-amount">
          {props.step === 0 && props.reference === null
            ? 'Your comparison starts here'
            : `${number(props.target)} US dollars`}
        </span>
      </div>
      <div className="stage-viewport">
        {props.step === 0 && props.reference === null ? (
          <div className="stage-fallback">
            Enter a valid reference to build your starting point.
          </div>
        ) : hidden ? (
          <div className="prediction-stage">
            <span className="question-mark">?</span>
            <p>
              How many millions
              <br />
              fit inside a billion?
            </p>
            <span>Make your prediction to reveal the scale.</span>
          </div>
        ) : illustrated ? (
          <Illustration count={count} />
        ) : (
          <Suspense
            fallback={
              <div className="stage-fallback">Preparing the scale model…</div>
            }
          >
            <ScaleStage
              introductory={props.step === 0}
              total={props.target}
              unit={props.unit}
              exploded={separated}
              reset={props.step * 10000 + props.resetToken + reset}
              reference={reference}
              quality={quality}
              captureInfo={captureInfo}
              onCapture={registerCapture}
              onFallback={() => setIllustrated(true)}
            />
          </Suspense>
        )}
      </div>
      {!hidden && props.reference !== null && (
        <p className="scale-anchor-note">
          {props.step === 0
            ? disclosure
            : props.target > 1e9
              ? `${disclosure} A fixed trillion-wide overview is used through $1T; larger amounts pull back further.`
              : `${number(count)} ${count === 1 ? 'million-dollar cube' : 'million-dollar cubes'}. The pale $1M anchor uses the same volume scale.`}
        </p>
      )}
      <div className="stage-tools">
        <span>
          {illustrated
            ? 'Same values, simplified illustration'
            : 'Drag / two fingers to orbit · swipe or scroll the page'}
        </span>
        <div>
          <button
            className="icon-button"
            disabled={illustrated || hidden}
            onClick={() => setAssembled(separated ? props.step : null)}
            aria-pressed={separated}
            aria-label={separated ? 'Assemble blocks' : 'Separate blocks'}
          >
            <Layers3 size={17} />
          </button>
          <button
            className="icon-button"
            onClick={() => {
              setReset((value) => value + 1)
              setAssembled(null)
            }}
            aria-label="Reset 3D view"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>
      <div className="scale-legend">
        <span className="legend-cube" />
        <div>
          <strong>
            {invalid
              ? 'A valid reference is needed'
              : `1 block = ${money(props.unit)}`}
          </strong>
          <span>
            {invalid
              ? 'No amount entered'
              : hidden
                ? 'Assembly hidden until your prediction'
                : `${number(count)} ${count === 1 ? 'block' : 'blocks'} · volume = value`}
          </span>
        </div>
        <span className="legend-index">USD / VOLUME</span>
      </div>
      {props.step > 0 && !hidden && (
        <div className="comparison-view-controls">
          <button
            aria-pressed={compare}
            disabled={props.reference === null || illustrated}
            onClick={() => setCompare(!compare)}
          >
            {compare
              ? 'Show the full assembly'
              : 'Compare volumes side by side'}
            <ArrowUpRight size={13} />
          </button>
          {reference && !illustrated && (
            <p>
              Mint = target. Gold = {money(reference)}{' '}
              {props.referenceKind === 'income'
                ? 'of annual income'
                : 'reference'}
              . Both volumes use the same scale; the smaller amount may be
              smaller than a pixel. Spaces between blocks carry no value.
            </p>
          )}
        </div>
      )}
      <details className="exhibit-settings">
        <summary>Graphics & image export</summary>
        <div className="exhibit-options">
          <QualitySelect
            value={quality}
            onChange={setQuality}
            label="Scale graphics quality"
          />
          <button
            disabled={!capture || illustrated || hidden || saving}
            onClick={() => void save()}
          >
            <Download size={14} />
            {saving ? 'Saving…' : 'Save image'}
          </button>
        </div>
        <p className="source-note" role="status">
          {message ||
            'Saves the displayed model and reference locally. No uploads.'}
        </p>
      </details>
      {props.asOf && (
        <p className="source-note">
          Estimate as of {props.asOf}.{' '}
          <a
            href="https://github.com/komed3/rtb-api"
            target="_blank"
            rel="noreferrer"
          >
            Forbes via RTB-API <ArrowUpRight size={11} />
          </a>
        </p>
      )}
    </section>
  )
}
