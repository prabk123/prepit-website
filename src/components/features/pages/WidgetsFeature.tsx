import WidgetImage from "@/components/device/WidgetImage";
import ScreenCard from "@/components/features/ScreenCard";
import { Chip, Split, V9Section } from "@/components/landing/v9/V9Sections";
import SwipeRow from "@/components/ui/SwipeRow";
import { appCapture, widgetCapture } from "@/lib/captures";

/** Where Log a meal can live, each with its real screen and one line. */
const ONE_PRESS = [
  {
    title: "Action button.",
    line: "Press and hold, and Siri asks what you ate.",
    capture: appCapture("26-action-button-shortcut", "The Action button set to PrepIt's Log a meal shortcut"),
  },
  {
    title: "Lock Screen.",
    line: "A Log a meal button, or your scores and water.",
    capture: appCapture("26b-lock-screen-control", "A Log a meal button on the Lock Screen"),
  },
  {
    title: "Control Centre.",
    line: "One tap opens Log Meal, ready to type or talk.",
    capture: appCapture("26c-control-centre", "Adding the Log a meal control to Control Centre"),
  },
];

/**
 * /features/widgets-and-siri (PRE-455, from Charlie's site pages handoff,
 * docs/copy/06-widgets.md): the widgets as real captures, the Siri phrases,
 * then the Action button, Lock Screen and Control Centre as three real
 * screens. The hero, related tiles and closing band are shared.
 */
export default function WidgetsFeature() {
  return (
    <>
      <V9Section id="widgets" name="widgets" labelledBy="widgets-heading" band>
        <Split
          reverse
          text={
            <>
              <h2 id="widgets-heading" className="font-display text-chapter text-ink text-balance">
                Your day, on your Home Screen.
              </h2>
              <p className="max-w-[34em] text-lead text-ink-secondary text-pretty">
                Your scores, today&apos;s plan and your water, every time you unlock your phone. Log a planned meal or add a
                drink right on the widget.
              </p>
              <div className="flex flex-wrap gap-2">
                <Chip>Today&apos;s plan</Chip>
                <Chip>Water in one tap</Chip>
                <Chip>Lock Screen and StandBy</Chip>
              </div>
              <p className="text-small text-ink-muted">Buttons on widgets need iOS 17 or later.</p>
            </>
          }
          media={
            <div className="mx-auto flex w-full max-w-[360px] flex-col gap-5">
              <WidgetImage
                shadow="card"
                capture={widgetCapture(
                  "15-widget-today-plan-large",
                  "Today's plan widget with Log it and Skip on each meal",
                  1014,
                  1062,
                )}
              />
              <WidgetImage
                shadow="card"
                capture={widgetCapture("15-widget-water-medium", "The water widget with one-tap amounts", 1014, 474)}
              />
            </div>
          }
        />
      </V9Section>

      <V9Section id="siri" name="siri" labelledBy="siri-heading">
        <Split
          text={
            <>
              <h2 id="siri-heading" className="font-display text-chapter text-ink text-balance">
                “Hey Siri, log a meal in PrepIt.”
              </h2>
              <p className="max-w-[34em] text-lead text-ink-secondary text-pretty">
                Siri asks what you ate and when, and it&apos;s on your log. There&apos;s nothing to set up. Say “Log lunch in
                PrepIt” and it skips the time question.
              </p>
            </>
          }
          media={
            <ScreenCard
              capture={appCapture("22-action-button-siri", "What did you eat? asked over the Lock Screen")}
            />
          }
        />
      </V9Section>

      <V9Section id="one-press" name="one-press" labelledBy="one-press-heading" band>
        <div className="flex flex-col gap-10">
          <div className="flex flex-col gap-4">
            <h2 id="one-press-heading" className="font-display text-chapter text-ink text-balance">
              One press, from anywhere.
            </h2>
            <p className="max-w-[34em] text-lead text-ink-secondary text-pretty">
              Put Log a meal where your thumb already is.
            </p>
          </div>
          {/* One row you swipe on phones, so three tall screens take one screen height. */}
          <SwipeRow label="Places to put Log a meal" itemClassName="w-[72%] max-w-[300px] lg:flex-1">
            {ONE_PRESS.map((place) => (
              <div key={place.title} className="flex w-full flex-col gap-3">
                <ScreenCard width="fill" capture={place.capture} />
                <p className="pl-1 text-[13.5px] text-ink-muted">
                  <b className="font-semibold text-ink">{place.title}</b> {place.line}
                </p>
              </div>
            ))}
          </SwipeRow>
          <p className="text-small text-ink-muted">The Log a meal control needs iOS 18 or later.</p>
        </div>
      </V9Section>
    </>
  );
}
