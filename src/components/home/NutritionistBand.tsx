import DeviceFrame from "@/components/device/DeviceFrame";
import DevicePair from "@/components/device/DevicePair";
import PhotoBand from "@/components/ui/PhotoBand";
import PointList from "@/components/ui/PointList";
import SectionHeading from "@/components/ui/SectionHeading";
import TextLink from "@/components/ui/TextLink";
import { appCapture, appVideo } from "@/lib/captures";
import { nutritionistEvening } from "@/content/lifestyle";

const ASKS = [
  { title: "Charts on request", detail: "“Show my protein this week”" },
  { title: "Voice notes", detail: "Talk, and hear a spoken reply" },
  { title: "You confirm", detail: "Every log, plan or goal change" },
];

/** "Ask anything": the chat, on the evening photo. */
export default function NutritionistBand() {
  return (
    <PhotoBand
      id="ask"
      labelledBy="ask-heading"
      analyticsName="ask-anything"
      photo={nutritionistEvening.desktop}
      phonePhoto={nutritionistEvening.mobile}
      annotations={nutritionistEvening.annotations}
      textSide={nutritionistEvening.textSide}
      aside={
        <>
          <PointList layout="rows" points={ASKS} />
          <TextLink href="/features/ai-nutritionist">More about your nutritionist</TextLink>
        </>
      }
      media={
        <DevicePair className="[--device-w:260px] sm:[--device-w:290px] lg:[--device-w:clamp(260px,20vw,300px)]">
          <DeviceFrame
            video={appVideo(
              "08-chat-ask",
              "Asking the nutritionist for a high-protein breakfast for tomorrow and getting its reply",
            )}
          />
          <DeviceFrame
            className="hidden sm:block"
            capture={appCapture(
              "10-voice-note",
              "A voice note to the nutritionist and its spoken reply, with a Log it card",
            )}
          />
        </DevicePair>
      }
    >
      <SectionHeading
        id="ask-heading"
        size="section"
        title="Ask anything. It knows your goals, your day and your last meal."
        lead="Answers in plain language, built on what you actually ate. It can log, move or fix a meal, and set your goals, right from chat."
      />
    </PhotoBand>
  );
}
