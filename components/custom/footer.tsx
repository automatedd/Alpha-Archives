import { cn } from "@/lib/utils";
import Link from "next/link";
import { FunctionComponent } from "react";

interface FooterProps {
    className?: string
}

const Footer: FunctionComponent<FooterProps> = ({ className }) => {
    const menus = [
        { name: "About Us", link: "#" },
        { name: "Contact Us", link: "#" },
        { name: "Terms", link: "#" },
        { name: "Privacy", link: "#" }
    ]
    return (<>
        <footer className={cn("flex pt-10 md:pt-20 flex-col items-center justify-center", className)}>
            <nav className="flex text-xs md:text-sm gap-8 items-center">
                {menus.map((menu) => <Link key={menu.name} href={menu.link} className="hover:text-yellow-500">{menu.name}</Link>)}
            </nav>
            <h4 className="text-5xl md:text-[160px] font-normal bg-linear-to-b from-white to-transparent bg-clip-text text-transparent mt-20">
                <span className="font-bold">
                    Alpha
                </span> Archives
            </h4>
        </footer>
    </>);
}

export default Footer;