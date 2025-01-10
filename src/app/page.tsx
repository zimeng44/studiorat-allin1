import { HeroSection } from "@/components/custom/HeroSection";
import { FeatureSection } from "@/components/custom/FeaturesSection";

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

export default async function Home() {
  const strapiData = {
    id: 1,

    title: "Home Page",

    description: "This is our first page",

    blocks: [
      {
        id: 1,

        __component: "layout.hero-section",

        heading: "Studio Rat",

        subHeading: "Your studio management assistant",

        image: { url: "/hero.jpg" },

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
