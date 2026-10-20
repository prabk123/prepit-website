import DeviceFrame from "@/components/device/DeviceFrame";
import FeatureBlock from "@/components/features/FeatureBlock";
import Glow from "@/components/ui/Glow";
import TextLink from "@/components/ui/TextLink";
import { appCapture, appVideo } from "@/lib/captures";

const PHONE = "[--device-w:260px] sm:[--device-w:300px] lg:[--device-w:clamp(260px,22vw,320px)]";

/**
 * /features/logging: the answer to "I've quit trackers before". Typing,
 * photo, Siri and the Action button, accuracy, offline. Typed, photo and Siri
 * meals go on the log straight away; only chat cards wait for a tap.
 */
export default function LoggingFeature() {
  return (
    <>
      <FeatureBlock
        id="type-it"
        tone="surface"
        title="Type it like you'd text a friend."
        lead="“Chicken wrap, an apple and a flat white” is enough. It's on your log straight away, and the calories and macros fill in a few seconds later."
        media={
          <div className="relative">
            <Glow />
            <DeviceFrame
              className={PHONE}
              capture={appCapture(
                "01b-home-log",
                "Today's log in PrepIt: protein overnight oats, coffee with milk and a chicken wrap with hummus, each with its calories and its effect on Energy, Satiety and Mood",
              )}
            />
          </div>
        }
      >
        <p className="max-w-[56ch] text-body text-ink-muted text-pretty">
          There&apos;s no database to search and no barcode to find. A couple of extra words, like how much, how it
          was cooked or the brand, get the numbers much closer to the truth. Rather talk? Tap the mic and say it.
        </p>
        <TextLink href="/guides/describe-meals-accurately">Guide: describe meals accurately</TextLink>
      </FeatureBlock>

      <FeatureBlock
        id="snap-it"
        reverse
        title="Or just snap your plate."
        lead="Take a photo and PrepIt works out what's on the plate. Add a few words, like the restaurant or the portion, and it uses both."
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
        title="Close to the truth, and easy to fix."
        lead="Branded and restaurant food starts from the official figures. Typed and photo meals show what PrepIt assumed."
        media={
          <div className="relative">
            <Glow />
            <DeviceFrame
              className={PHONE}
              capture={appCapture(
                "05-meal-detail",
                "Protein overnight oats with apple and cinnamon: 357 calories, 40 g carbs, 34 g protein and 7 g fat, with each item it assumed, like 51 calories of rolled oats, and edit at the top",
              )}
            />
          </div>
        }
      >
        <p className="max-w-[56ch] text-body text-ink-muted text-pretty">
          When it&apos;s unsure, it asks. “Dinner at a restaurant” gets a quick question from your nutritionist, so
          your day stays accurate. And if something looks off, you can edit any item or ask for it to be refined.
        </p>
      </FeatureBlock>

      <FeatureBlock
        id="siri"
        reverse
        title="Log it without opening the app."
        lead="Say “Hey Siri, log a meal in PrepIt”. Siri asks what you ate and when, and it's on your log. There's nothing to set up."
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
        <p className="max-w-[56ch] text-body text-ink-muted text-pretty">
          Put the same action on the Action button and logging is one press and a sentence. You can also add a Log
          a meal button to your Lock Screen or Control Centre (iOS 18 or later).
        </p>
        <TextLink href="/features/widgets-and-siri">More about widgets and Siri</TextLink>
      </FeatureBlock>

      <FeatureBlock
        id="offline"
        layout="peek"
        tone="surface"
        title="No signal? Log anyway."
        lead="On a train or a flight, meals, water, supplements and weight save on your phone. They send on their own when you're back, and nothing is logged twice."
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
