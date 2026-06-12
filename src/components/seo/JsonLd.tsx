/** Injecte un ou plusieurs objets JSON-LD dans un <script type="application/ld+json">. */
export function JsonLd({ data }: { data: object[] }) {
  return (
    <>
      {data.map((obj, i) => (
        <script
          key={i}
          type="application/ld+json"
          // JSON sérialisé côté serveur (SSG) — sûr.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(obj) }}
        />
      ))}
    </>
  );
}
