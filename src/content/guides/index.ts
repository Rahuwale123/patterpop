import type { ComponentType } from "react";
import { Body as PhotoToPattern, steps as photoSteps } from "./photo-to-pattern";
import { Body as FabricCount } from "./fabric-count";
import { Body as Skeins } from "./skeins";

/** Article bodies by guide slug (metadata is in src/data/guides.ts). HowTo steps where the guide is a how-to. */
export const guideContent: Record<string, { Body: ComponentType; steps?: { name: string; text: string }[] }> = {
  "how-to-turn-a-photo-into-a-cross-stitch-pattern": { Body: PhotoToPattern, steps: photoSteps },
  "cross-stitch-fabric-count-guide": { Body: FabricCount },
  "how-many-skeins-of-floss-do-i-need": { Body: Skeins },
};
