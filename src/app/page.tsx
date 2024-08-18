// import { Button } from '@/components/ui/button';
// import { getHomePageData } from "@/data/loaders";
import { HeroSection } from "@/components/custom/HeroSection";
// import { flattenAttributes } from "@/lib/utils";
// import qs from "qs";
// import { getStrapiURL } from "@/lib/utils";
import { FeatureSection } from "@/components/custom/FeaturesSection";

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
  // const strapiData = await getHomePageData();
  // console.log('data length: ',strapiData.data);
  const strapiData = {
    id: 1,

    title: "Home Page",

    description: "This is our first page",

    createdAt: "2024-07-13T00:54:28.607Z",

    updatedAt: "2024-08-12T06:39:08.885Z",

    publishedAt: "2024-07-13T00:54:29.608Z",

    blocks: [
      {
        id: 1,

        __component: "layout.hero-section",

        heading: "Studio Rat",

        subHeading: "Your studio management assistant",

        image: {},

        link: {
          id: 1,

          url: "/signin",

          text: "Sign In",

          isExternal: false,
        },
      },

      {
        id: 1,

        __component: "layout.features-section",

        title: "Features Section",

        description: "This is where our features live",

        feature: [
          {
            id: 1,

            heading: "Booking",

            subHeading:
              "Book a studio or equipment for your personal or academic projects. ",

            icon: "CLOCK_ICON",
          },

          {
            id: 3,

            heading: "Studio Operation",

            subHeading:
              "Tools help studio monitors to keep the daily operation of the studios in check.",

            icon: "CHECK_ICON",
          },

          {
            id: 2,

            heading: "On Cloud",

            subHeading: "Everything is done on the cloud hassle free",

            icon: "CLOUD_ICON",
          },
        ],
      },
    ],

    meta: {},
  };

  const { blocks } = strapiData;

  if (!blocks) return <div>No block found</div>;

  return (
    <main className="container mx-auto py-6">
      {blocks.map((block: any) => blockRenderer(block))}
    </main>
  );
}
