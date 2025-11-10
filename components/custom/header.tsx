import { cn } from "@/lib/utils";
import Image from "next/image";
import { FunctionComponent } from "react";
import TypeformDialogWithCorrectIframe from "../TypeformDialog";
interface HeaderProps {
    className?: string
}

const Header: FunctionComponent<HeaderProps> = ({ className }) => {
    return (<>
        <header className={cn("fixed top-0 md:pt-4 left-0 z-50 w-full", className)}>
            <div className="max-w-5xl mx-auto bg-white p-1 md:rounded-full flex items-center">
                <div className="flex items-center">
                    <Image src={"/logo.png"} width={64} height={64} className="max-md:size-10" alt="Logo" />
                    <span className="text-black">
                        <span className="font-bold">Alpha</span> Archive
                    </span>
                </div>

                <div className="ml-auto">
                    <TypeformDialogWithCorrectIframe />
                </div>
            </div>
        </header>
    </>);
}

export default Header;