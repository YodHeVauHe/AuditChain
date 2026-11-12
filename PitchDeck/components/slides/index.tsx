import type { SlideMeta } from "@/components/presentation/presentation";
import CoverSlide from "./01-cover";
import ProblemSlide from "./02-problem";
import AuditGapSlide from "./03-audit-gap";
import InsightSlide from "./04-insight";
import SolutionSlide from "./05-solution";
import HowItWorksSlide from "./06-how-it-works";
import IntegrityDemoSlide from "./07-integrity-demo";
import ProcurementSlide from "./08-procurement";
import AuditorViewSlide from "./09-auditor-view";
import WhyBlockchainSlide from "./10-why-blockchain";
import TechnologySlide from "./11-technology";
import InnovationSlide from "./12-innovation";
import MarketSlide from "./13-market";
import UgandaSlide from "./14-uganda";
import ValidationSlide from "./15-validation";
import BusinessModelSlide from "./16-business-model";
import WhyNowSlide from "./17-why-now";
import MvpSlide from "./18-mvp";
import AskSlide from "./19-the-ask";
import RoadmapSlide from "./20-roadmap";
import ClosingSlide from "./21-closing";

export const slideIds = [
  "cover",
  "problem",
  "audit-gap",
  "insight",
  "solution",
  "how-it-works",
  "integrity-demo",
  "procurement",
  "auditor-view",
  "why-blockchain",
  "technology",
  "innovation",
  "market",
  "uganda",
  "validation",
  "business-model",
  "why-now",
  "mvp",
  "the-ask",
  "roadmap",
  "closing",
] as const;

export const slides: SlideMeta[] = [
  { id: "cover", num: "01", title: "Cover", component: () => <CoverSlide /> },
  { id: "problem", num: "02", title: "The Problem", component: () => <ProblemSlide /> },
  { id: "audit-gap", num: "03", title: "The Audit Gap", component: () => <AuditGapSlide /> },
  { id: "insight", num: "04", title: "The Insight", component: () => <InsightSlide /> },
  { id: "solution", num: "05", title: "The Solution", component: () => <SolutionSlide /> },
  { id: "how-it-works", num: "06", title: "How It Works", component: () => <HowItWorksSlide /> },
  { id: "integrity-demo", num: "07", title: "Integrity Demo", component: () => <IntegrityDemoSlide /> },
  { id: "procurement", num: "08", title: "Procurement", component: () => <ProcurementSlide /> },
  { id: "auditor-view", num: "09", title: "Auditor View", component: () => <AuditorViewSlide /> },
  { id: "why-blockchain", num: "10", title: "Why Blockchain", component: () => <WhyBlockchainSlide /> },
  { id: "technology", num: "11", title: "Technology", component: () => <TechnologySlide /> },
  { id: "innovation", num: "12", title: "Innovation", component: () => <InnovationSlide /> },
  { id: "market", num: "13", title: "Market", component: () => <MarketSlide /> },
  { id: "uganda", num: "14", title: "Uganda", component: () => <UgandaSlide /> },
  { id: "validation", num: "15", title: "Validation", component: () => <ValidationSlide /> },
  { id: "business-model", num: "16", title: "Business Model", component: () => <BusinessModelSlide /> },
  { id: "why-now", num: "17", title: "Why Now", component: () => <WhyNowSlide /> },
  { id: "mvp", num: "18", title: "MVP", component: () => <MvpSlide /> },
  { id: "the-ask", num: "19", title: "The Ask", component: () => <AskSlide /> },
  { id: "roadmap", num: "20", title: "Roadmap", component: () => <RoadmapSlide /> },
  { id: "closing", num: "21", title: "Closing", component: () => <ClosingSlide /> },
];
