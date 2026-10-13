import DeviceFrame from "@/components/device/DeviceFrame";
import FeatureBlock from "@/components/features/FeatureBlock";
import Glow from "@/components/ui/Glow";
import PointList from "@/components/ui/PointList";
import TextLink from "@/components/ui/TextLink";
import { appCapture, appVideo } from "@/lib/captures";

const PHONE = "[--device-w:260px] sm:[--device-w:300px] lg:[--device-w:clamp(260px,22vw,320px)]";

/** /features/logging: typing, photo, Siri and the Action button, accuracy and confirmation, offline. */
export default function LoggingFeature() {
  return (
    <>
      <FeatureBlock
        id="type-it"
        tone="surface"
        title="Type it like you'd text a friend."
        lead="“Chicken wrap, an apple and a flat white” is enough. Add the brand, the restaurant, the size or what was in it, and the estimate gets sharper."
        media={
          <div className="relative">
            <Glow />
            <DeviceFrame
              className={PHONE}
              capture={appCapture(
                "01b-home-log",
                "Today's log in PrepIt: coffee with milk, a chicken wrap, Greek yogurt and a salmon bowl, each with its calories and its effect on Energy, Satiety and Mood",
              )}
            />
          </div>
        }
      >
        <PointList
          layout="rows"
          points={[
            { title: "Your own words", detail: "No database to search" },
            { title: "Or say it", detail: "Tap the mic and talk" },
            { title: "Any meal", detail: "Home-cooked, takeaway or a restaurant" },
          ]}
        />
        <TextLink href="/guides/describe-meals-accurately">Guide: describe meals accurately</TextLink>
      </FeatureBlock>

      <FeatureBlock
        id="snap-it"
        reverse
        title="Or just snap your plate."
        lead="Take a photo of your meal and PrepIt works out what's on it. Add a few words, like the restaurant or the portion, and it uses both."
        media={
          <div className="relative">
            <Glow />
            <DeviceFrame
              className={PHONE}
              video={appVideo("04-log-photo", "Logging a meal from a photo of the plate")}
            />
          </div>
        }
      >
        <TextLink href="/guides/log-a-meal-with-a-photo">Guide: log a meal with a photo</TextLink>
      </FeatureBlock>

      <FeatureBlock
        id="accuracy"
        tone="surface"
        title="Accurate, and always your call."
        lead="PrepIt checks official brand and restaurant nutrition information first. Every estimate shows what it assumed and how confident it is, and nothing is logged until you're happy with it."
        media={
          <div className="relative">
            <Glow />
            <DeviceFrame
              className={PHONE}
              capture={appCapture(
                "05b-meal-detail-scrolled",
                "A logged breakfast's Energy, Satiety and Mood cards, and How it's calculated with a High confidence level of 82",
              )}
            />
          </div>
        }
      >
        <PointList
          layout="rows"
          points={[
            { title: "Official sources first", detail: "Brand and restaurant figures" },
            { title: "Shows its working", detail: "Every assumption, one tap to fix" },
            { title: "Asks when it's unsure", detail: "“Dinner at a restaurant” gets a question" },
            { title: "You confirm", detail: "Nothing is saved until it looks right" },
          ]}
        />
      </FeatureBlock>

      <FeatureBlock
        id="siri"
        reverse
        title="No app to open."
        lead="Say “Hey Siri, log a meal in PrepIt”. Siri asks what you ate and when, and it's logged. Put the same action on the Action button, or a Log a meal button on your Lock Screen."
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
            { title: "Siri", detail: "No setup needed" },
            { title: "Action button", detail: "Press and hold, then say it" },
            { title: "Lock Screen and Control Center", detail: "iOS 18 or later" },
          ]}
        />
        <TextLink href="/features/widgets-and-siri">More about widgets and Siri</TextLink>
      </FeatureBlock>

      <FeatureBlock
        id="offline"
        tone="surface"
        title="No signal? Log anyway."
        lead="Meals, water, supplements and weight save on your phone with no signal. They send on their own when you're back, and nothing is logged twice."
        media={
          <div className="relative">
            <Glow />
            <DeviceFrame
              className={PHONE}
              capture={appCapture(
                "18b-offline-waiting-list",
                "PrepIt offline: water and a weight waiting to send, with Try again now",
              )}
            />
          </div>
        }
      />
    </>
  );
}
