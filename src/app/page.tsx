// import { Button } from '@/components/ui/button';
import { getHomePageData } from "@/data/loaders";
import { HeroSection } from "@/components/custom/HeroSection";
// import { flattenAttributes } from "@/lib/utils";
// import qs from "qs";
// import { getStrapiURL } from "@/lib/utils";
import { FeatureSection } from "@/components/custom/FeaturesSection";
import type { Viewport } from "next";

export const viewport: Viewport = {
  width: "device-width",
  userScalable: false,
};

// const homePageQuery = qs.stringify({
//   populate: {
//     blocks: {
//       populate: {
//         image: {
//           fields: ["url", "alternativeText"],
//         },
//         link: {
//           populate: true,
//         },
//         feature: {
//           populate: true,
//         },
//       },
//     },
//   },
// });

function blockRenderer(block: any) {
  switch (block.__component) {
    case "layout.hero-section":
      return <HeroSection key={block.id} data={block} />;
    case "layout.features-section":
      return <FeatureSection key={block.id} data={block} />;
    default:
      return null;
  }
}

// async function getStrapiData(path: string) {
//   const baseUrl = getStrapiURL();

//   const url = new URL(path, baseUrl);
//   url.search = homePageQuery;

//   try {
//     const res = await fetch(url.href, { cache: "no-store" });
//     const data = await res.json();
//     const flattenedData = flattenAttributes(data);
//     return flattenedData;
//   } catch (error) {
//     console.error(error);
//   }
// }

export default async function Home() {
  const strapiData = await getHomePageData();
  // console.log('data length: ',strapiData.data);

  const { blocks } = strapiData;

  if (!blocks) return <div>No block found</div>;

  return (
    <main className="container mx-auto py-6">
      {blocks.map((block: any) => blockRenderer(block))}
    </main>
  );
}
