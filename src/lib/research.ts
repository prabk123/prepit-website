/**
 * The reading list on /research (PRE-278, regrouped in PRE-456 from
 * Charlie's site pages handoff, docs/copy/07-research.md).
 *
 * Grouped by kind of evidence, never by score: a list per score told a
 * reader which study feeds which input. "We publish what it's built on. The
 * recipe stays in the kitchen." Keep the per-score factor lists and
 * confidence wording off the site too.
 *
 * PrepIt runs general-purpose AI models with its own instructions, data and
 * scoring, so never claim it was "trained by dietitians", "trained on
 * studies", "clinically validated" or "reviewed by a registered dietitian".
 * The scoring code doesn't name its papers; these are the well-known
 * published work and public guidance its parts rest on. Leave out papers
 * whose titles read as health claims (weight loss, weight gain, depression)
 * and WHO, whose rules cover its name in promotion.
 */

export type ResearchSource = {
  /** Short reference: authors, year and title, or the body's page name. */
  citation: string;
  /** Journal or publisher, shown after the citation. */
  where: string;
  url: string;
};

export type ResearchGroup = {
  /** Fixed slug, used as the React key. */
  id: string;
  title: string;
  sources: ResearchSource[];
};

export const RESEARCH_PAGE_HREF = "/research";

export const READING_LIST: ResearchGroup[] = [
  {
    id: "food-data",
    title: "Food data",
    sources: [
      {
        citation: "Public Health England. McCance and Widdowson's Composition of Foods Integrated Dataset (CoFID).",
        where: "GOV.UK",
        url: "https://www.gov.uk/government/publications/composition-of-foods-integrated-dataset-cofid",
      },
      {
        citation: "U.S. Department of Agriculture. FoodData Central.",
        where: "USDA Agricultural Research Service",
        url: "https://fdc.nal.usda.gov/",
      },
    ],
  },
  {
    id: "targets",
    title: "Targets",
    sources: [
      {
        citation: "Mifflin MD, St Jeor ST, et al. (1990). A new predictive equation for resting energy expenditure in healthy individuals.",
        where: "American Journal of Clinical Nutrition",
        url: "https://doi.org/10.1093/ajcn/51.2.241",
      },
    ],
  },
  {
    id: "scores",
    title: "Nutrition research behind the scores",
    sources: [
      {
        citation: "Jenkins DJA, et al. (1981). Glycemic index of foods: a physiological basis for carbohydrate exchange.",
        where: "American Journal of Clinical Nutrition",
        url: "https://doi.org/10.1093/ajcn/34.3.362",
      },
      {
        citation: "Salmerón J, et al. (1997). Dietary fiber, glycemic load, and risk of non-insulin-dependent diabetes mellitus in women.",
        where: "JAMA",
        url: "https://doi.org/10.1001/jama.1997.03540300040031",
      },
      {
        citation: "Atkinson FS, Foster-Powell K, Brand-Miller JC. (2008). International tables of glycemic index and glycemic load values.",
        where: "Diabetes Care",
        url: "https://doi.org/10.2337/dc08-1239",
      },
      {
        citation:
          "Leidy HJ, et al. (2013). Beneficial effects of a higher-protein breakfast on the appetitive, hormonal, and neural signals controlling energy intake regulation.",
        where: "American Journal of Clinical Nutrition",
        url: "https://doi.org/10.3945/ajcn.112.053116",
      },
      {
        citation: "Mantantzis K, et al. (2019). Sugar rush or sugar crash? A meta-analysis of carbohydrate effects on mood.",
        where: "Neuroscience & Biobehavioral Reviews",
        url: "https://doi.org/10.1016/j.neubiorev.2019.03.016",
      },
      {
        citation: "Weigle DS, et al. (2005). A high-protein diet induces sustained reductions in appetite.",
        where: "American Journal of Clinical Nutrition",
        url: "https://doi.org/10.1093/ajcn/82.1.41",
      },
      {
        citation: "Slavin J, Green H. (2007). Dietary fibre and satiety.",
        where: "Nutrition Bulletin",
        url: "https://doi.org/10.1111/j.1467-3010.2007.00603.x",
      },
      {
        citation: "Rolls BJ. (2009). The relationship between dietary energy density and energy intake.",
        where: "Physiology & Behavior",
        url: "https://doi.org/10.1016/j.physbeh.2009.03.011",
      },
      {
        citation: "Monteiro CA, et al. (2019). Ultra-processed foods: what they are and how to identify them.",
        where: "Public Health Nutrition",
        url: "https://doi.org/10.1017/S1368980018003762",
      },
      {
        citation: "White BA, Horwath CC, Conner TS. (2013). Many apples a day keep the blues away: daily experiences of affect and food consumption.",
        where: "British Journal of Health Psychology",
        url: "https://doi.org/10.1111/bjhp.12021",
      },
      {
        citation: "Lane MM, et al. (2024). Ultra-processed food exposure and adverse health outcomes: umbrella review.",
        where: "BMJ",
        url: "https://doi.org/10.1136/bmj-2023-077310",
      },
      {
        citation: "Reynolds A, et al. (2019). Carbohydrate quality and human health: a series of systematic reviews and meta-analyses.",
        where: "The Lancet",
        url: "https://doi.org/10.1016/S0140-6736(18)31809-9",
      },
      {
        citation: "UK Chief Medical Officers. (2016). Low risk drinking guidelines.",
        where: "GOV.UK",
        url: "https://www.gov.uk/government/publications/alcohol-consumption-advice-on-low-risk-drinking",
      },
      {
        citation: "SACN. (2015). Carbohydrates and health.",
        where: "GOV.UK",
        url: "https://www.gov.uk/government/publications/sacn-carbohydrates-and-health-report",
      },
    ],
  },
  {
    id: "coaching",
    title: "Coaching and behaviour change",
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
      {
        citation: "Michie S, et al. (2009). Effective techniques in healthy eating and physical activity interventions: a meta-regression.",
        where: "Health Psychology",
        url: "https://doi.org/10.1037/a0016136",
      },
    ],
  },
  {
    id: "public-health",
    title: "Public health guidance",
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
];

/** The count up top, worked out from the list so the two never drift apart. */
export const READING_LIST_COUNT = READING_LIST.reduce((total, group) => total + group.sources.length, 0);

/** The public health bodies behind supplement and water amounts (NHS, EFSA, NIH, CDC). */
export const PUBLIC_HEALTH_BODY_COUNT = 4;
