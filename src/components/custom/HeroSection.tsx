import Link from "next/link";
import { StrapiImage } from "./StrapiImage";
import { getUserMeLoader } from "@/data/services/get-user-me-loader";

interface ImageProps {
  id: number;
  url: string;
  alternativeText: string;
}

interface LinkProps {
  id: number;
  url: string;
  text: string;
}

interface HeroSectionProps {
  data: {
    id: number;
    __component: string;
    heading: string;
    subHeading: string;
    image: ImageProps;
    link: LinkProps;
  };
}

export async function HeroSection({ data }: Readonly<HeroSectionProps>) {
  const user = await getUserMeLoader();
  // console.dir(data, { depth: null });
  const { heading, subHeading, image, link } = data;
  // const imageURL = "http://localhost:1337" + image.url;
  const userLoggedIn = user.ok;
  const linkUrl = userLoggedIn ? "/dashboard" : link.url;

  return (
    <header className="relative h-[600px] overflow-hidden">
      <StrapiImage
        alt="Background"
        className="absolute inset-0 h-full w-full object-cover"
        height={1080}
        src={image.url}
        width={1920}
      />
      <div className="relative z-10 flex h-full flex-col items-center justify-center bg-black bg-opacity-20 text-center text-white">
        <h1 className="text-4xl font-bold md:text-5xl lg:text-6xl">
          {heading}
        </h1>
        <p className="mt-4 text-lg md:text-xl lg:text-2xl">{subHeading}</p>
        <Link
          className="mt-8 inline-flex items-center justify-center rounded-md bg-white px-6 py-3 text-base font-medium text-black shadow hover:bg-gray-100"
          href={linkUrl}
        >
          {user.ok ? "Go to Dashboard" : link.text}
        </Link>
      </div>
    </header>
  );
}
