'use client'

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { FunctionComponent } from "react";

interface ThankHeroProps {
    className?: string
}

const ThankHero: FunctionComponent<ThankHeroProps> = ({ className }) => {
    const searchParams = useSearchParams();
    const name = searchParams.get('name');
    return (<>
        <section id="hero" className="pt-30 md:pt-80 h-screen pb-20 md:px-0 px-5 relative">
            <div className="max-w-xl mx-auto text-center relative">
                <Image src={"/bnb.svg"} width={28} height={28} alt="bnb" className="absolute md:block hidden opacity-20 left-20 -top-10" />
                <Image src={"/dingocoin.svg"} width={72} height={72} alt="dingocoin" className="absolute md:block hidden opacity-20 -left-30" />
                <Image src={"/monero.svg"} width={52} height={52} alt="monero" className="absolute md:block hidden opacity-20 top-60 -left-20" />
                <Image src={"/btc.svg"} width={44} height={44} alt="btc" className="absolute md:block hidden opacity-20 top-40 -right-20" />
                <Image src={"/eth.svg"} width={28} height={28} alt="eth" className="absolute md:block hidden opacity-20 right-20" />
                <h1 className="md:text-4xl text-2xl font-semibold mt-8 md:font-bold md:leading-12">
                    Thank you for applying
                </h1>
                <h2 className="text-yellow-600 font-extrabold text-6xl mt-8">{name}</h2>
                <h3 className="mt-8">
                    Your appointment has scheduled.<br />
                    Check Your Email for The Invitation on the Scheduled Day & Time.
                </h3>
                <p className="mt-8">
                    ⚠️ <b>Warning:</b> <i>Failure to attend the meeting may result in blacklisting.</i>
                </p>
            </div>
        </section>
    </>);
}

export default ThankHero;