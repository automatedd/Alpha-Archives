import CustomSvgIcon from "@/components/customsvg";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge";
import CustomVideoPlayer from "@/components/videoplayer";
import Image from "next/image";
import React from "react";
export default function ApplyNow() {
    return (
        <>
            <section id="hero" className="pt-30 md:pt-50 pb-20 md:px-0 px-5 relative">
                <div className="max-w-xl mx-auto text-center relative">
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
                        Secure Your Spot now <br /><span className="text-red-600">Only 25 Available</span>
                    </h1>
                    <h3 className="mt-8">
                        Complete your application below
                    </h3>
                    <p className="text-sm">
                        Complete this quick application to see if you qualify for the Alpha Archive Portal Method. We only accept serious students ready to build their $3,000-$15,000/month Crypto business.
                    </p>
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
                <div className="max-w-xl mx-auto border-2 border-yellow-500 rounded-2xl overflow-hidden mt-10 bg-white w-full">
                    <iframe
                        key={"https://form.typeform.com/to/UdJF2S9y?typeform-medium=embed"} // ensure remount when src changes
                        title={"form"}
                        src={"https://form.typeform.com/to/UdJF2S9y?typeform-medium=embed"}
                        style={{ width: "100%", border: 0 }}
                        className="h-[560px]"
                        allow={"camera; microphone; autoplay; encrypted-media;"}
                    />
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
                        <Image alt="sc-2" width={280} height={583} src={"/jtxMyma.png"} className="border-2 border-yellow-500 rounded-lg" />
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

                        <Image alt="sc-3" width={280} height={412} src={"/Wm1D2Tk.png"} className="border-2 border-yellow-500 rounded-lg" />
                    </div>
                    <div className="space-y-2">
                        <Image alt="sc-4" width={280} height={583} src={"/lMeSrBy.png"} className="border-2 border-yellow-500 rounded-lg" />
                        <Image alt="sc-4" width={280} height={583} src={"/7DCXf6l.png"} className="border-2 border-yellow-500 rounded-lg" />
                    </div>
                </div>
            </section>
        </>
    );
}
