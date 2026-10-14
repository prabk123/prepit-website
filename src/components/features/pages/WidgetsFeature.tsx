import DeviceFrame from "@/components/device/DeviceFrame";
import WidgetImage from "@/components/device/WidgetImage";
import FeatureBlock from "@/components/features/FeatureBlock";
import { BentoGrid, BentoTile } from "@/components/ui/Bento";
import Glow from "@/components/ui/Glow";
import PhotoBand from "@/components/ui/PhotoBand";
import PointList from "@/components/ui/PointList";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import TextLink from "@/components/ui/TextLink";
import { widgetsDesk } from "@/content/featureImagery";
import { appCapture, widgetCapture } from "@/lib/captures";

const PHONE = "[--device-w:260px] sm:[--device-w:300px] lg:[--device-w:clamp(260px,22vw,320px)]";

/** /features/widgets-and-siri: Home Screen and Lock Screen widgets, Siri, the Action button and Control Center. */
export default function WidgetsFeature() {
  return (
    <>
      <PhotoBand
        id="your-day"
        labelledBy="your-day-heading"
        photo={widgetsDesk.desktop}
        phonePhoto={widgetsDesk.mobile}
        textSide={widgetsDesk.textSide}
      >
        <SectionHeading
          id="your-day-heading"
          size="section"
          title="Your day, on your Home Screen."
          lead="Today's scores, plan, water and streak at a glance, and buttons that do the job right on the widget."
        />
      </PhotoBand>

      <Section id="widgets" labelledBy="widgets-heading">
        <div className="flex flex-col gap-stack">
          <SectionHeading
            id="widgets-heading"
            size="section"
            title="Widgets that do things."
            lead="Add a drink, tick a supplement or log a planned meal without opening PrepIt."
          />
          <BentoGrid>
            <BentoTile
              size="large"
              mediaAlign="center"
              title="Today's plan"
              media={
                <div className="w-full max-w-[420px]">
                  <WidgetImage
                    capture={widgetCapture(
                      "15-widget-today-plan-large",
                      "Large Today's plan widget with Log it and Skip on planned meals",
                      1014,
                      1062,
                    )}
                  />
                </div>
              }
            >
              Every meal on today&apos;s plan, with Log it and Skip that work right on the widget.
            </BentoTile>
            <BentoTile
              size="medium"
              title="Water"
              media={
                <WidgetImage
                  capture={widgetCapture(
                    "15-widget-water-medium",
                    "Medium water widget with today's total and buttons to add 250, 500 or 750 ml",
                    1014,
                    474,
                  )}
                />
              }
            >
              Add 250, 500 or 750 ml with one tap, and the total goes up straight away.
            </BentoTile>
            <BentoTile
              size="medium"
              title="Energy, Satiety and Mood"
              media={
                <WidgetImage
                  capture={widgetCapture(
                    "15-widget-signals-medium",
                    "Medium widget with today's Energy, Satiety and Mood rings",
                    1014,
                    474,
                  )}
                />
              }
            >
              Today&apos;s three scores, as on Home. Tap one to see what shaped it.
            </BentoTile>
            <BentoTile
              title="Streak"
              media={
                <div className="w-full max-w-[200px]">
                  <WidgetImage
                    capture={widgetCapture("15-widget-streak-small", "Small streak widget", 474, 474)}
                  />
                </div>
              }
            >
              Your streak and the next milestone.
            </BentoTile>
            <BentoTile
              title="Quick water"
              media={
                <div className="w-full max-w-[200px]">
                  <WidgetImage
                    capture={widgetCapture(
                      "15-widget-water-small",
                      "Small water widget with today's total and a button to add 250 ml",
                      474,
                      474,
                    )}
                  />
                </div>
              }
            >
              One tap adds your usual drink.
            </BentoTile>
            <BentoTile size="medium" title="And more">
              Tick off today&apos;s supplements, see today&apos;s nutrition and your next planned meal, and
              put your scores, streak, water and supplements on your Lock Screen and in StandBy.
            </BentoTile>
          </BentoGrid>
          <p className="text-small text-ink-faint">
            Buttons on widgets need iOS 17 or later. Widgets follow your light or dark mode.
          </p>
          <TextLink href="/guides/add-prepit-widgets">Guide: add PrepIt widgets</TextLink>
        </div>
      </Section>

      <FeatureBlock
        id="siri"
        tone="surface"
        title="“Hey Siri, log a meal in PrepIt.”"
        lead="Siri asks what you ate and when you had it, and logs it without opening the app. There's nothing to set up. Say “Log lunch in PrepIt” and it skips the time question."
        media={
          <div className="relative">
            <Glow />
            <DeviceFrame
              className={PHONE}
              capture={appCapture(
                "22-action-button-siri",
                "Siri asking “What did you eat?” after a press of the Action button, without opening PrepIt",
              )}
            />
          </div>
        }
      >
        <PointList
          layout="rows"
          points={[
            { title: "Siri", detail: "“Log what I ate in PrepIt” works too" },
            { title: "Shortcuts and Spotlight", detail: "The same Log a meal action" },
          ]}
        />
      </FeatureBlock>

      <Section id="one-press" labelledBy="one-press-heading">
        <div className="flex flex-col gap-stack">
          <SectionHeading
            id="one-press-heading"
            size="section"
            title="One press, from anywhere."
            lead="Put Log a meal where your thumb already is."
          />
          <PointList
            layout="columns"
            points={[
              {
                title: "Action button",
                detail: "Set it to PrepIt's Log a meal shortcut. Press and hold, and Siri asks what you ate.",
              },
              {
                title: "Lock Screen",
                detail:
                  "Add the Log a meal button, or widgets for your scores, streak, water and supplements.",
              },
              {
                title: "Control Center",
                detail: "Add the Log a meal control. One tap opens Log Meal, ready to type or talk.",
              },
            ]}
          />
          <p className="text-small text-ink-faint">The Log a meal control needs iOS 18 or later.</p>
          <TextLink href="/guides/log-a-meal-with-the-action-button">
            Guide: log a meal with the Action button
          </TextLink>
        </div>
      </Section>
    </>
  );
}
