import type { EtapesContent } from "@/types/config";
import type { BlockComponentProps } from "@/blocks/types";
import { FilSection } from "../ui/Section";
import { FilContainer } from "../ui/Container";
import { FilHeading } from "../ui/Heading";
import { FilEtapesThread } from "../ui/Thread";

/**
 * « Comment ça se passe » — fil : la TIMELINE COUSUE, section signature de la
 * famille. Un fil de couture se trace au fil du scroll et noue chaque étape à
 * son passage (voir `ui/Thread.tsx`, SSR complet + progressive enhancement).
 */
export function Etapes({ block, tone }: BlockComponentProps<EtapesContent>) {
  const c = block.content;
  return (
    <FilSection id="etapes" tone={tone}>
      <FilContainer>
        <FilHeading
          kicker={c.eyebrow ?? "Le fil conducteur"}
          title={c.titre ?? "Comment ça se passe"}
          lede={c.intro}
        />
        <FilEtapesThread items={c.items} />
      </FilContainer>
    </FilSection>
  );
}
