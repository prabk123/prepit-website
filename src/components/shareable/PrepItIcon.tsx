export const ICONS = {
  arrowLeft: "\uEA01",
  arrowRight: "\uEA02",
  plus: "\uEA03",
  minus: "\uEA04",
  close: "\uEA05",
  checkmark: "\uEA06",
  user: "\uEA07",
  warning: "\uEA08",
  search: "\uEA09",
  fire: "\uEA0A",
  clock: "\uEA0B",
  calendar: "\uEA0C",
  restaurant: "\uEA0D",
  heartFilled: "\uEA0E",
  heartEmpty: "\uEA0F",
  share: "\uEA10",
  cart: "\uEA11",
  bookmarkFilled: "\uEA12",
  bookmarkEmpty: "\uEA13",
  filter: "\uEA14",
  wallet: "\uEA15",
  menu: "\uEA16",
  orderArrows: "\uEA17",
  grid: "\uEA18",
  dropdown: "\uEA19",
  eye: "\uEA1A",
  chevronLeft: "\uEA1B",
  chevronRight: "\uEA1C",
  sparkles: "\uEA1D",
  paste: "\uEA1E",
  link: "\uEA1F",
  camera: "\uEA20",
  pencil: "\uEA21",
  book: "\uEA22",
  chefHat: "\uEA23",
  wheat: "\uEA24",
  menuDots: "\uEA25",
  image: "\uEA26",
  chevronDown: "\uEA27",
  cartPlus: "\uEA28",
  edit: "\uEA29",
  mail: "\uEA2A",
  leaf: "\uEA2B",
  calendar2: "\uEA2C",
  basket: "\uEA2D",
  upDown: "\uEA2E",
  scanBarcode: "\uEA2F",
  calendarDay: "\uEA30",
  scale: "\uEA31",
  scanFood1: "\uEA32",
  scanFood2: "\uEA33",
  list: "\uEA34",
  refresh: "\uEA35",
  apple: "\uEA36",
  trash: "\uEA37",
  shuffle: "\uEA38",
  lock: "\uEA39",
  report: "\uEA3A",
  goal: "\uEA3B",
  appleLogo: "\uEA3C",
  googleLogo: "\uEA3D",
  chevronUp: "\uEA3E",
  home: "\uEA3F",
  charts: "\uEA40",
  clockEmpty: "\uEA41",
  history: "\uEA42",
  bell: "\uEA43",
  arrowUp: "\uEA44",
  arrowDown: "\uEA45",
  swap: "\uEA46",
  info: "\uEA47",
  protein: "\uEA48",
  fat: "\uEA49",
  homeLeaf: "\uEA4A",
  starFilled: "\uEA4B",
  starEmpty: "\uEA4C",
  microphone: "\uEA4F",
} as const;

export type PrepItIconName = keyof typeof ICONS;

interface PrepItIconProps {
  name: PrepItIconName;
  size?: number;
  color?: string;
  className?: string;
}

export default function PrepItIcon({
  name,
  size = 24,
  color,
  className = "",
}: PrepItIconProps) {
  return (
    <span
      className={className}
      style={{
        fontFamily: "var(--font-prepit-icons)",
        fontSize: size,
        lineHeight: 1,
        color,
        display: "inline-block",
        fontStyle: "normal",
        fontWeight: "normal",
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
      }}
      aria-hidden="true"
    >
      {ICONS[name]}
    </span>
  );
}
