import CustomSvgIcon from "@/components/customsvg";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge";
import CustomVideoPlayer from "@/components/videoplayer";
import { ArrowUpRight, BadgeCheckIcon, BarChart2Icon, Brain, DollarSign, HandCoins, Megaphone, UserCircle, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
export default function Home() {
  const reasons = [
    {
      "id": 1,
      "reason": "The Fastest-Moving Wealth Machine On Earth",
      "icon": DollarSign,
      "description": "In the last 12 months, billions poured into memecoins and new tokens have hit $100M+ market caps in days. Tiny bets turned into life-changing payouts — $100 → $50k, $1k → $1M — all from viral narrative + liquidity. While econ and YouTube fight for scraps, memecoins hand out generational checks to the bold.",
      "note": "👉 If you’re not in this cycle, you’re letting other people get rich off the next big wave."
    },
    {
      "id": 2,
      "reason": "Explosive Growth, Low Gatekeepers, No Waiting",
      "icon": BarChart2Icon,
      "description": "Every other online model is throttled by platforms, ad bans, and slow scaling. Crypto is different: fast-moving on-chain liquidity, global buyers, and viral distribution that scales in hours — not months. Millions in daily on-chain volume. Billion-dollar moves in community-driven pumps. Governments can debate regulation — insiders are already stacked.",
      "note": "👉 This window won’t last forever — get in while the runway is still clear."
    },
    {
      "id": 3,
      "reason": "The Highest-Paying Niche — Hands Down",
      "icon": HandCoins,
      "description": "EPCs and LTVs in crypto blow traditional offers out of the water. Affiliate funnels, token launches, influencer promos and trading calls routinely net $20–$80 EPC and 5–7 figure launches when done right. People don’t “click” — they ape. Emotion = instant conversions.",
      "note": "👉 If you’re not in this cycle, you’re letting other people get rich off the next big wave."
    },
    {
      "id": 4,
      "reason": "Multiple Kill-Switch Monetization Paths (Do All Of Them)",
      "icon": Zap,
      "description": <>
        This isn’t one trick — it’s an entire money factory. With our system you can:
        <ul className="list-disc my-4 *:ml-5">
          <li>
            <b>Launch legit, hype-driven</b> tokens and monetize via launch allocations, liquidity events, and community sales (we teach tokenomics that scale).
          </li>
          <li>
            <b>Trade with precision</b> using our alpha calls and market signals — capture fast 2x/5x moves without gambling blind.
          </li>
          <li>
            <b>Become a paid crypto influencer</b> (no audience required) — plug into our promo networks and get paid to push launches, AMAs, and drops.
          </li>
          <li>
            <b>Sell premium products & services</b> — private signals, VIP channels, paid airdrop lists, launch consulting, and merch for your cult.
          </li>
        </ul>
        That means you’re not betting on one play — you’re running a diversified, high-velocity business that collects revenue from every angle of the meme economy.
      </>,
      "note": "👉 One community. Ten income streams. Unlimited upside"
    }
  ]
  const benefits = [
    {
      "id": 1,
      "title": "Personal 1-on-1 Coach: Your Dedicated Success Partner",
      "icon": UserCircle,
      "description": "Get assigned a personal coach who makes $30,000+ a month from crypto & memecoins. Get full support and guides on how they make money from launching, trading, and being a crypto influencer. Provides private chat support and conducts one-on-one strategy calls whenever you need guidance."
    },
    {
      "id": 2,
      "title": "Learn The Best Launching Strategies",
      "icon": Brain,
      "description": "Learn how to successfully replicate successful launches like $DOGWIFHAT, $CHILLGUY and more! These launches can change your life and make you tons of money in such a fast amount of time."
    },
    {
      "id": 3,
      "title": "Premium Alpha Callouts",
      "icon": Megaphone,
      "description": "Get access to the best alpha callouts in the game! Weekly callouts, always vetted to ensure it's the best alpha — with minimal risk and maximum potential to make you the most money."
    }
  ]

  return (
    <>
      <section id="hero" className="pt-30 md:pt-50 pb-20 md:px-0 px-5 relative">
        <div className="max-w-4xl mx-auto text-center relative">
          <Image src={"/bnb.svg"} width={28} height={28} alt="bnb" className="absolute md:block hidden opacity-20 left-20 -top-10" />
          <Image src={"/dingocoin.svg"} width={72} height={72} alt="dingocoin" className="absolute md:block hidden opacity-20 -left-30" />
          <Image src={"/monero.svg"} width={52} height={52} alt="monero" className="absolute md:block hidden opacity-20 top-60 -left-20" />
          <Image src={"/btc.svg"} width={44} height={44} alt="btc" className="absolute md:block hidden opacity-20 top-40 -right-20" />
          <Image src={"/eth.svg"} width={28} height={28} alt="eth" className="absolute md:block hidden opacity-20 right-20" />
          <span className="p-1 rounded-full max-md:text-sm bg-red-600/20 border-2 border-red-600">
            <span className="bg-red-600 rounded-full px-2 py-0.5">
              Urgent
            </span>
            <span className="mx-2">
              LIMITED SPOTS AVAILABLE
            </span>
          </span>
          <h1 className="md:text-4xl text-2xl font-semibold mt-8 md:font-bold md:leading-12">
            Learn How to Print With <span className="text-yellow-500">Crypto & Memecoins</span> By Launching Your Own Memecoins, Finding 100x Weekly Callouts & Even Becoming a <span className="text-yellow-500">Crypto Influencer!</span>
          </h1>
          <h3 className="mt-8">
            Copy this blueprint and start earning $10K+ A month From Crypto Just like Our other students!
          </h3>
        </div>
        <div className="mt-30 w-fit relative z-10 flex items-center justify-center mx-auto mb-10">
          <CustomSvgIcon className="size-12 absolute z-0 opacity-25 -left-[22px]" color="oklch(79.5% 0.184 86.047)" />
          <p className="text-sm relative z-10">
            Why over 2000+ people chose to work with us
          </p>
          <div className="*:data-[slot=avatar]:border-yellow-500 ml-10 flex -space-x-4 *:data-[slot=avatar]:border-2">
            <Avatar className="size-10">
              <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <Avatar className="size-10">
              <AvatarImage
                src="https://github.com/maxleiter.png"
                alt="@maxleiter"
              />
              <AvatarFallback>LR</AvatarFallback>
            </Avatar>
            <Avatar className="size-10">
              <AvatarImage
                src="https://github.com/evilrabbit.png"
                alt="@evilrabbit"
              />
              <AvatarFallback>ER</AvatarFallback>
            </Avatar>
            <div className="size-10 bg-yellow-500 rounded-full z-10 flex">
              <span className="m-auto text-xs">2k+</span>
            </div>
          </div>
        </div>
        <div className="max-w-5xl mx-auto">
          <AspectRatio ratio={16 / 9} className="bg-yellow-500 p-1 shadow-[0_0_300px_-50px] shadow-amber-500 rounded-lg">
            <CustomVideoPlayer
              src="/video.mp4"
              poster="/poster.png"
              autoPlay={false}
              preload="metadata"
            />
          </AspectRatio>
        </div>
        <div className="mt-12 mx-auto w-fit">
          <div className="mx-auto w-fit mb-6">
            <Link href={"/book-now"} className="py-1 cursor-pointer group pr-1 pl-6 rounded-full border-2 border-yellow-500 bg-linear-to-r flex items-center from-yellow-500 text-black via-yellow-500 to-yellow-950 shadow-xl shadow-amber-500/30">
              <span className="text-lg font-semibold">
                Work with us
              </span>
              <span className="size-12 flex rounded-full bg-white ml-15">
                <ArrowUpRight className="text-yellow-950 m-auto group-hover:translate-x-1 duration-300 group-hover:-translate-y-1" />
              </span>
            </Link>
          </div>
          <div className="flex items-center">
            <p className="text-sm">
              Limited Spots available
            </p>
            <div className="flex p-1 ml-8 border-2 rounded-lg gap-1 border-yellow-500">
              <div className="w-4 h-5 rounded bg-yellow-500" />
              <div className="w-4 h-5 rounded bg-yellow-500" />
              <div className="w-4 h-5 rounded bg-yellow-500" />
              <div className="w-4 h-5 rounded bg-yellow-500" />
              <div className="w-4 h-5 rounded bg-yellow-500/20">
                <div className="w-4 h-5 rounded bg-yellow-500 animate-(--animation-blink)" />
              </div>
              <div className="w-4 h-5 rounded bg-yellow-500/20" />
              <div className="w-4 h-5 rounded bg-yellow-500/20" />
              <div className="w-4 h-5 rounded bg-yellow-500/20" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 mx-auto gap-2 mt-10 w-fit">
          <Image alt="sc-1" width={179} height={366} src={"/jtxMyma.png"} className="border-2 border-yellow-500 rounded-lg" />
          <Image alt="sc-1" width={179} height={366} src={"/5EcVOas.png"} className="border-2 border-yellow-500 rounded-lg" />
          <Image alt="sc-1" width={179} height={366} src={"/7DCXf6l.png"} className="border-2 border-yellow-500 rounded-lg" />
        </div>
      </section>
      <section id="reason" className="py-20 md:px-0 px-5">
        <div className="max-w-2xl text-center mx-auto">
          <Badge className="mt-4">
            Tons of Reasons
          </Badge>
          <h1 className="md:text-4xl text-2xl font-semibold mt-8 md:font-bold md:leading-12">
            Why is <span className="text-yellow-500">Crypto & Memecoins</span> The Best Way to Generate Income Right Now?
          </h1>
          <h3 className="mt-8 md:text-xl font-medium">
            🚀 Why <span className="text-yellow-500">Crypto & Memecoins Are The #1</span> Way To Build Insane Wealth Online Right Now
          </h3>
        </div>
        <div className="max-w-5xl shadow-[0_-30px_100px_-60px] shadow-yellow-500 mt-20 bg-white rounded-2xl border-yellow-500 text-black border-2 mx-auto p-4 md:p-8 ">
          <div className="grid grid-cols-1 md:grid-cols-3">
            <div className="col-span-2">
              {reasons.map((item) => <div key={item.id} className="border-2 border-gray-100 rounded-2xl mb-5 p-4 md:p-8 last:mb-0">
                <div className="flex items-center gap-4">
                  <div className="size-14 flex border-2 border-gray-100 rounded-lg">
                    <item.icon size={24} className="m-auto text-red-600" />
                  </div>
                  <h3 className="md:text-xl font-semibold flex-1">
                    <span className="text-red-600">
                      Reason #{item.id}:
                    </span> {item.reason}
                  </h3>
                </div>
                <div className="mt-8 max-sm:text-sm">
                  {typeof item.description === "string" ? item.description.split('\n').map((line, index) => (
                    <React.Fragment key={index}>
                      {line}
                      {typeof item.description === "string" &&
                        index < item.description.split('\n').length - 1 && <br />}
                    </React.Fragment>
                  )) : item.description}
                </div>
                <p className="text-sm italic mt-4">
                  {item.note}
                </p>
              </div>)}
            </div>
            <div className="col-span-1 p-5">
              <div className="flex items-center mb-10">
                <Image src={"/logo.png"} width={64} height={64} alt="Logo" />
                <div className="text-black ml-2">
                  <div className="flex text-lg items-center">
                    <span className="font-bold mr-1">Alpha</span> Archive <BadgeCheckIcon className="ml-2" />
                  </div>
                  <button className="text-sm px-3 py-0.5 font-medium bg-yellow-400 rounded-full">Follow</button>
                </div>
              </div>
              <Image src={"/Group8.png"} width={317} height={737} alt="pics" />
            </div>
          </div>
        </div>
        <p className="font-medium mt-16 max-w-3xl mx-auto text-center">
          This is not a slow hustle — it’s a parabolic era where attention converts to cash faster than anything else online. If you skip this you’ll be buying screenshots of other people’s Lambo receipts for years. Get in now, learn the playbook, and let the next memecoin wave print your life-changing score.
        </p>
        <div className="mt-18 mx-auto w-fit">
          <div className="mx-auto w-fit mb-6">
            <Link href={"/book-now"} className="py-1 cursor-pointer group pr-1 pl-6 rounded-full border-2 border-yellow-500 bg-linear-to-r flex items-center from-yellow-500 text-black via-yellow-500 to-yellow-950 shadow-xl shadow-amber-500/30">
              <span className="text-lg font-semibold">
                Work with us
              </span>
              <span className="size-12 flex rounded-full bg-white ml-15">
                <ArrowUpRight className="text-yellow-950 m-auto group-hover:translate-x-1 duration-300 group-hover:-translate-y-1" />
              </span>
            </Link>
          </div>
          <div className="mt-12 w-fit relative z-10 flex items-center justify-center mx-auto mb-10">
            <CustomSvgIcon className="size-12 absolute z-0 opacity-25 -left-[22px]" color="oklch(79.5% 0.184 86.047)" />
            <p className="text-sm relative z-10">
              Why over 2000+ people chose to work with us
            </p>
            <div className="*:data-[slot=avatar]:border-yellow-500 ml-10 flex -space-x-4 *:data-[slot=avatar]:border-2">
              <Avatar className="size-10">
                <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <Avatar className="size-10">
                <AvatarImage
                  src="https://github.com/maxleiter.png"
                  alt="@maxleiter"
                />
                <AvatarFallback>LR</AvatarFallback>
              </Avatar>
              <Avatar className="size-10">
                <AvatarImage
                  src="https://github.com/evilrabbit.png"
                  alt="@evilrabbit"
                />
                <AvatarFallback>ER</AvatarFallback>
              </Avatar>
              <div className="size-10 bg-yellow-500 rounded-full z-10 flex">
                <span className="m-auto text-xs">2k+</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section id="benefit" className="py-20 md:px-0 px-5">
        <div className="max-w-2xl text-center mx-auto">
          <Badge className="mt-4">
            Benefits for you
          </Badge>
          <h1 className="md:text-4xl text-2xl font-semibold mt-8 md:font-bold md:leading-12">
            What You Get When You Work Directly With my team To Build <span className="text-yellow-500">Your $10,000-$15000+ A MONTH Crypto Empire</span>
          </h1>
        </div>
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-2 mt-20">
          {benefits.map((item) => <div key={item.id} className="h-[480px] md:h-[560px] border-2 border-yellow-500 bg-linear-to-b rounded-2xl flex flex-col from-yellow-500 to-transparent p-8">
            <div className="size-14">
              <item.icon size={56} strokeWidth={1} />
            </div>
            <div className="mt-auto">
              <h2 className="mb-5 text-xl md:text-2xl font-semibold">
                {item.title}
              </h2>
              <p className="text-sm font-medium">
                {item.description}
              </p>
            </div>
          </div>)}
        </div>
      </section>
      <section id="results" className="py-20 md:px-0 px-5">
        <div className="max-w-xl text-center mx-auto">
          <Badge className="mt-4">
            Results Speak
          </Badge>
          <h1 className="md:text-4xl text-2xl font-semibold mt-8 md:font-bold md:leading-12">
            Are Other People Seeing Success With <span className="text-yellow-500">Alpha Archives?</span>
          </h1>
        </div>
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-2 mt-10 md:mt-20">
          <div className="space-y-2">
            <Image alt="sc-1" width={280} height={147} src={"/1nVYGdY.png"} className="border-2 border-yellow-500 rounded-lg" />
            <Image alt="sc-1" width={280} height={583} src={"/jtxMyma.png"} className="border-2 border-yellow-500 rounded-lg" />
          </div>
          <div className="grid gap-2">
            <div className="w-[280px]">
              <AspectRatio ratio={9 / 16} className="bg-yellow-500 p-0.5 shadow-[0_0_300px_-50px] shadow-amber-500 h-full rounded-lg">
                <CustomVideoPlayer
                  src="/alphaarchives1.mp4"
                  autoPlay={false}
                  preload="metadata"
                />
              </AspectRatio>
            </div>

            <Image alt="sc-1" width={280} height={412} src={"/Wm1D2Tk.png"} className="border-2 border-yellow-500 rounded-lg" />
          </div>
          <Image alt="sc-2" width={280} height={583} src={"/jtxMyma.png"} className="border-2 border-yellow-500 rounded-lg" />
        </div>
      </section>
      <section id="cta" className="py-20 md:px-0 px-5 my-20 bg-radial from-0% to-100% border-y-2 border-yellow-500/20 from-yellow-500/20 to-transparent">
        <div className="max-w-3xl text-center mx-auto">
          <span className="p-1 max-sm:text-sm rounded-full bg-red-600/20 border-2 border-red-600">
            <span className="bg-red-600 rounded-full px-2 py-0.5">
              Urgent
            </span>
            <span className="mx-2">
              LIMITED SPOTS AVAILABLE
            </span>
          </span>
          <h1 className="md:text-4xl text-2xl font-semibold mt-8 md:font-bold md:leading-12">
            Lock In Your Spot NOW Before <span className="text-red-500">Its gone!</span>
          </h1>
          <p className="mt-5 max-md:text-sm">
            This is Your Chance to cash-in on the crypto boom that is making hundreds of smart people financially free. This opportunity won&apos;t last forever. Only 25 spots available in this enrollement period, and the next one isnt until Marrch 2026.
          </p>
          <div className="mt-18 mx-auto w-fit">
            <div className="mx-auto w-fit mb-6">
              <Link href={"/book-now"} className="py-1 cursor-pointer group pr-1 pl-6 rounded-full border-2 border-yellow-500 bg-linear-to-r flex items-center from-yellow-500 text-black via-yellow-500 to-yellow-950 shadow-xl shadow-amber-500/30">
                <span className="text-lg font-semibold">
                  Work with us
                </span>
                <span className="size-12 flex rounded-full bg-white ml-15">
                  <ArrowUpRight className="text-yellow-950 m-auto group-hover:translate-x-1 duration-300 group-hover:-translate-y-1" />
                </span>
              </Link>
            </div>
            <div className="flex items-center mx-auto w-fit">
              <p className="text-sm text-left">
                Limited Spots available
              </p>
              <div className="flex p-1 ml-8 border-2 rounded-lg gap-1 border-yellow-500">
                <div className="w-4 h-5 rounded bg-yellow-500" />
                <div className="w-4 h-5 rounded bg-yellow-500" />
                <div className="w-4 h-5 rounded bg-yellow-500" />
                <div className="w-4 h-5 rounded bg-yellow-500" />
                <div className="w-4 h-5 rounded bg-yellow-500/20">
                  <div className="w-4 h-5 rounded bg-yellow-500 animate-(--animation-blink)" />
                </div>
                <div className="w-4 h-5 rounded bg-yellow-500/20" />
                <div className="w-4 h-5 rounded bg-yellow-500/20" />
                <div className="w-4 h-5 rounded bg-yellow-500/20" />
              </div>
            </div>
            <div className="mt-12 bg-neutral-900 p-5 rounded-full pl-8 w-fit relative z-10 flex items-center justify-center mx-auto mb-10">
              <CustomSvgIcon className="size-12 absolute z-0 opacity-25 left-3" color="oklch(79.5% 0.184 86.047)" />
              <p className="text-sm relative text-left  z-10">
                Why over 2000+ people chose to work with us
              </p>
              <div className="*:data-[slot=avatar]:border-yellow-500 ml-10 flex -space-x-4 *:data-[slot=avatar]:border-2">
                <Avatar className="size-10">
                  <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <Avatar className="size-10">
                  <AvatarImage
                    src="https://github.com/maxleiter.png"
                    alt="@maxleiter"
                  />
                  <AvatarFallback>LR</AvatarFallback>
                </Avatar>
                <Avatar className="size-10">
                  <AvatarImage
                    src="https://github.com/evilrabbit.png"
                    alt="@evilrabbit"
                  />
                  <AvatarFallback>ER</AvatarFallback>
                </Avatar>
                <div className="size-10 bg-yellow-500 rounded-full z-10 flex">
                  <span className="m-auto text-xs">2k+</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
