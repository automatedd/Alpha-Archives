import { cn } from "@/lib/utils";
import Image from "next/image";
import { FunctionComponent } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
interface HeaderProps {
    className?: string
}

const Header: FunctionComponent<HeaderProps> = ({ className }) => {
    return (<>
        <header className={cn("fixed top-0 md:pt-4 left-0 z-50 w-full", className)}>
            <div className="max-w-5xl mx-auto bg-white p-1 md:rounded-full flex items-center">
                <Link href={"/"} className="flex items-center">
                    <Image src={"/logo.png"} width={64} height={64} className="max-md:size-10" alt="Logo" />
                    <span className="text-black">
                        <span className="font-bold">Alpha</span> Archive
                    </span>
                </Link>

                <div className="ml-auto">
                    <Link href={"/book-now"} className="py-1 cursor-pointer group pr-1 pl-6 rounded-full border-2 border-yellow-500 bg-linear-to-r flex items-center from-yellow-500 text-black via-yellow-500 to-yellow-950 shadow-xl shadow-amber-500/30">
                        <span className="text-lg font-semibold">
                            Work with us
                        </span>
                        <span className="size-12 flex rounded-full bg-white ml-15">
                            <ArrowUpRight className="text-yellow-950 m-auto group-hover:translate-x-1 duration-300 group-hover:-translate-y-1" />
                        </span>
                    </Link>
                </div>
            </div>
        </header>
    </>);
}

export default Header;