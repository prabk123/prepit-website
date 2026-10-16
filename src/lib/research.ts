/**
 * "How your nutritionist decides what to say" (PRE-278): the six points on the
 * homepage research band and the /research page, with the published sources
 * behind each one.
 *
 * Every point is checked against what the app and backend do today. Keep it
 * that way: PrepIt runs general-purpose AI models with its own instructions,
 * data and scoring, so never claim it was "trained by dietitians", "trained on
 * studies", "clinically validated" or "reviewed by a registered dietitian".
 * The scoring code doesn't name its papers; the sources below are the
 * well-known published work and public guidance each factor rests on.
 */

export type ResearchSource = {
  /** Short reference: authors, year and title, or the body's page name. */
  citation: string;
  /** Journal or publisher, shown after the citation. */
  where: string;
  url: string;
  /** Which part it backs, for grouping a long list ("Energy", "Satiety", "Mood"). */
  topic?: string;
};

export type ResearchPoint = {
  /** Fixed slug, also the anchor on /research. Never change one. */
  id: string;
  title: string;
  /** The fuller line, on /research. */
  detail: string;
  /** One short line for the homepage band (PRE-284), for the points in HOME_RESEARCH_POINT_IDS. */
  summary?: string;
  /** A little more on /research, above the sources. */
  more?: string;
  sources: ResearchSource[];
};

export const RESEARCH_PAGE_HREF = "/research";

/** The three points the homepage band shows (PRE-284); /research has all six. */
export const HOME_RESEARCH_POINT_IDS = ["scores", "numbers", "limits"] as const;

export const RESEARCH_POINTS: ResearchPoint[] = [
  {
    id: "knows-you",
    title: "It gets to know you first",
    detail:
      "A short consultation about how you eat now ends with one or two things to focus on. It remembers your goals, what you've told it about your routine and your recent conversations, and builds its replies around them.",
    more: "Advice that ignores your week isn't much use. Your focus, your routine and what you said last time are part of every reply, so you don't have to explain yourself twice.",
    sources: [],
  },
  {
    id: "coaching",
    title: "It coaches the way good nutritionists do",
    detail:
      "It borrows from motivational interviewing, the way of talking about change that many dietitians and health coaches use: it reflects back what you said, asks one question at a time, and never talks about cheat days or bad food.",
    more: "Motivational interviewing is a well-studied way of helping people change habits by drawing out their own reasons, rather than lecturing.",
    sources: [
      {
        citation: "Rubak S, et al. (2005). Motivational interviewing: a systematic review and meta-analysis.",
        where: "British Journal of General Practice",
        url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC1463134/",
      },
      {
        citation: "Miller WR, Rollnick S. (2009). Ten things that motivational interviewing is not.",
        where: "Behavioural and Cognitive Psychotherapy",
        url: "https://doi.org/10.1017/S1352465809005128",
      },
    ],
  },
  {
    id: "scores",
    title: "Its scores come from nutrition science",
    summary:
      "Energy, Satiety and Mood weigh what nutrition science links to how you feel: glycaemic load, protein, fibre and how processed your food is.",
    detail:
      "Energy weighs things like glycaemic load, how much sugar you eat, protein in the morning and how you spread your meals. Satiety weighs protein, fibre and how processed your food is, using the NOVA scale researchers use to grade processing. Mood looks at your whole previous day.",
    more: "Each score blends a handful of factors from your log. Energy: whether you've eaten enough for the time of day, sugar compared with other carbs, glycaemic load, protein in the morning, how your meals are spread and front-loaded, and whether you had breakfast. Satiety: protein, fibre, energy density, how processed your food is and the gaps between meals. Mood reads yesterday's processing, fruit and veg, fibre, sugar, alcohol and any big calorie deficit. The scores are estimates to guide your next meal, not a medical measurement.",
    sources: [
      {
        citation: "Jenkins DJA, et al. (1981). Glycemic index of foods: a physiological basis for carbohydrate exchange.",
        where: "American Journal of Clinical Nutrition",
        url: "https://doi.org/10.1093/ajcn/34.3.362",
        topic: "Energy",
      },
      {
        citation: "Salmerón J, et al. (1997). Dietary fiber, glycemic load, and risk of non-insulin-dependent diabetes mellitus in women.",
        where: "JAMA",
        url: "https://doi.org/10.1001/jama.1997.03540300040031",
        topic: "Energy",
      },
      {
        citation: "Atkinson FS, Foster-Powell K, Brand-Miller JC. (2008). International tables of glycemic index and glycemic load values.",
        where: "Diabetes Care",
        url: "https://doi.org/10.2337/dc08-1239",
        topic: "Energy",
      },
      {
        citation: "Leidy HJ, et al. (2013). Beneficial effects of a higher-protein breakfast on the appetitive, hormonal, and neural signals controlling energy intake regulation…",
        where: "American Journal of Clinical Nutrition",
        url: "https://doi.org/10.3945/ajcn.112.053116",
        topic: "Energy",
      },
      {
        citation: "Jakubowicz D, et al. (2013). High caloric intake at breakfast vs. dinner differentially influences weight loss.",
        where: "Obesity",
        url: "https://doi.org/10.1002/oby.20460",
        topic: "Energy",
      },
      {
        citation: "Mantantzis K, et al. (2019). Sugar rush or sugar crash? A meta-analysis of carbohydrate effects on mood.",
        where: "Neuroscience & Biobehavioral Reviews",
        url: "https://doi.org/10.1016/j.neubiorev.2019.03.016",
        topic: "Energy",
      },
      {
        citation: "Weigle DS, et al. (2005). A high-protein diet induces sustained reductions in appetite.",
        where: "American Journal of Clinical Nutrition",
        url: "https://doi.org/10.1093/ajcn/82.1.41",
        topic: "Satiety",
      },
      {
        citation: "Slavin J, Green H. (2007). Dietary fibre and satiety.",
        where: "Nutrition Bulletin",
        url: "https://doi.org/10.1111/j.1467-3010.2007.00603.x",
        topic: "Satiety",
      },
      {
        citation: "Rolls BJ. (2009). The relationship between dietary energy density and energy intake.",
        where: "Physiology & Behavior",
        url: "https://doi.org/10.1016/j.physbeh.2009.03.011",
        topic: "Satiety",
      },
      {
        citation: "Monteiro CA, et al. (2019). Ultra-processed foods: what they are and how to identify them.",
        where: "Public Health Nutrition",
        url: "https://doi.org/10.1017/S1368980018003762",
        topic: "Satiety",
      },
      {
        citation: "Hall KD, et al. (2019). Ultra-processed diets cause excess calorie intake and weight gain: an inpatient randomized controlled trial.",
        where: "Cell Metabolism",
        url: "https://doi.org/10.1016/j.cmet.2019.05.008",
        topic: "Satiety",
      },
      {
        citation: "White BA, Horwath CC, Conner TS. (2013). Many apples a day keep the blues away: daily experiences of affect and food consumption.",
        where: "British Journal of Health Psychology",
        url: "https://doi.org/10.1111/bjhp.12021",
        topic: "Mood",
      },
      {
        citation: "Jacka FN, et al. (2017). A randomised controlled trial of dietary improvement for adults with major depression (the SMILES trial).",
        where: "BMC Medicine",
        url: "https://doi.org/10.1186/s12916-017-0791-y",
        topic: "Mood",
      },
      {
        citation: "Lane MM, et al. (2024). Ultra-processed food exposure and adverse health outcomes: umbrella review.",
        where: "BMJ",
        url: "https://doi.org/10.1136/bmj-2023-077310",
        topic: "Mood",
      },
      {
        citation: "UK Chief Medical Officers. (2016). Low risk drinking guidelines.",
        where: "GOV.UK",
        url: "https://www.gov.uk/government/publications/alcohol-consumption-advice-on-low-risk-drinking",
        topic: "Mood",
      },
      {
        citation: "SACN. (2015). Carbohydrates and health.",
        where: "GOV.UK",
        url: "https://www.gov.uk/government/publications/sacn-carbohydrates-and-health-report",
        topic: "Satiety",
      },
    ],
  },
  {
    id: "numbers",
    title: "Its numbers come from real sources",
    summary:
      "Branded and restaurant food uses the official figures. Everyday foods use USDA nutrient data.",
    detail:
      "For branded and restaurant food it uses the official nutrition figures. For everyday foods, the nutrients come from USDA FoodData Central. When you don't give an amount, it assumes a typical portion and says so on the meal, along with how sure it is. If a meal is too vague, it asks.",
    sources: [
      {
        citation: "U.S. Department of Agriculture. FoodData Central.",
        where: "USDA Agricultural Research Service",
        url: "https://fdc.nal.usda.gov/",
      },
    ],
  },
  {
    id: "guidance",
    title: "It follows public health guidance",
    detail:
      "Supplement and water amounts come from public health bodies such as the NHS, the European Food Safety Authority (EFSA) and the US National Institutes of Health.",
    more: "When it suggests a supplement, it only uses the public reference amount for adults, never more. Your water goal starts from EFSA's adequate intake unless you set your own.",
    sources: [
      {
        citation: "NHS. Vitamins and minerals.",
        where: "nhs.uk",
        url: "https://www.nhs.uk/conditions/vitamins-and-minerals/",
      },
      {
        citation: "NIH Office of Dietary Supplements. Dietary supplement fact sheets.",
        where: "ods.od.nih.gov",
        url: "https://ods.od.nih.gov/factsheets/list-all/",
      },
      {
        citation: "CDC. Folic acid.",
        where: "Centers for Disease Control and Prevention",
        url: "https://www.cdc.gov/folic-acid/about/index.html",
      },
      {
        citation: "EFSA. (2017). Dietary reference values for nutrients: summary report.",
        where: "European Food Safety Authority",
        url: "https://www.efsa.europa.eu/sites/default/files/2017_09_DRVs_summary_report.pdf",
      },
      {
        citation: "EFSA Panel on Dietetic Products, Nutrition and Allergies. (2010). Scientific opinion on dietary reference values for water.",
        where: "EFSA Journal",
        url: "https://doi.org/10.2903/j.efsa.2010.1459",
      },
    ],
  },
  {
    id: "limits",
    title: "It knows its limits",
    summary:
      "It won't diagnose anything or go past public reference doses, and points you to your GP when something is medical.",
    detail:
      "It won't diagnose anything, and it never recommends or changes a dose beyond the public reference amount. For anything medical, or a question about your dose, it points you to your GP, a pharmacist or a registered dietitian.",
    sources: [],
  },
];
