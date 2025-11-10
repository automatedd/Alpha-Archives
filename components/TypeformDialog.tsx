'use client'

import React, { useMemo, useState } from "react";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"; // adjust path to your shadcn dialog
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";

type Props = {
    // Prefer passing the public iframe form id (from the share link)
    // Example: for https://form.typeform.com/to/UdJF2S9y, pass "UdJF2S9y"
    iframeFormId?: string;

    // Alternatively you can pass the full iframe URL (preferred if you already have it)
    // Example: "https://form.typeform.com/to/UdJF2S9y?typeform-medium=embed"
    iframeUrl?: string;

    triggerLabel?: React.ReactNode;
    width?: string | number; // e.g. "100%", 800
    height?: string | number; // e.g. 560
    title?: string;
    allow?: string; // iframe allow attribute (defaults provided)
    className?: string; // extra classes for DialogContent
    openInitially?: boolean;
    btnLg?: boolean
};

export default function TypeformIframeDialog({
    iframeFormId = "UdJF2S9y",
    iframeUrl = "https://form.typeform.com/to/UdJF2S9y?typeform-medium=embed",
    triggerLabel = "Work with us",
    width = "100%",
    height = 560,
    title = "Form",
    allow = "camera; microphone; autoplay; encrypted-media;",
    className = "",
    openInitially = false,
    btnLg = false
}: Props) {
    const [open, setOpen] = useState<boolean>(openInitially);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Build safe iframe src. Prefer explicit iframeUrl, then iframeFormId.
    const src = useMemo(() => {
        if (iframeUrl && iframeUrl.trim() !== "") return iframeUrl;
        if (iframeFormId && iframeFormId.trim() !== "")
            return `https://form.typeform.com/to/${encodeURIComponent(iframeFormId)}`;
        return null;
    }, [iframeUrl, iframeFormId]);

    // Convert width/height into style values
    const style: React.CSSProperties = {
        width: typeof width === "number" ? `${width}px` : String(width),
        height: typeof height === "number" ? `${height}px` : String(height),
        minHeight: typeof height === "number" ? `${Math.min(400, height)}px` : undefined,
    };

    // When the dialog opens we prepare to load the iframe
    const handleOpenChange = (val: boolean) => {
        setError(null);
        setLoading(false);
        setOpen(val);
        // If opening, we'll set loading true when iframe mounts via onLoadStart logic below
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                {btnLg ? <button className="py-1 cursor-pointer group pr-1 pl-6 rounded-full border-2 border-yellow-500 bg-linear-to-r flex items-center from-yellow-500 text-black via-yellow-500 to-yellow-950 shadow-xl shadow-amber-500/30">
                    <span className="text-lg font-semibold">
                        Work with us
                    </span>
                    <span className="size-12 flex rounded-full bg-white ml-15">
                        <ArrowUpRight className="text-yellow-950 m-auto group-hover:translate-x-1 duration-300 group-hover:-translate-y-1" />
                    </span>
                </button> : <button className="py-1 mr-1.5 pr-1 group pl-6 rounded-full ml-auto border-2 border-yellow-500 bg-linear-to-r flex items-center from-yellow-500 text-black via-yellow-500 to-yellow-900 shadow-xl shadow-amber-500/30">
                    <span className="max-md:text-sm font-medium">
                        {triggerLabel}
                    </span>
                    <span className="size-8 md:size-10 flex rounded-full bg-white ml-5 md:ml-15">
                        <ArrowUpRight className="text-yellow-950 m-auto group-hover:translate-x-1 duration-300 group-hover:-translate-y-1" />
                    </span>
                </button>}

            </DialogTrigger>

            <DialogContent className={`max-w-3xl bg-white text-black w-full ${className}`}>
                <DialogHeader className="hidden">
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>
                        Please complete the quick form below. If the form doesn&apos;t load, use the fallback link.
                    </DialogDescription>
                </DialogHeader>

                <div
                    style={style}
                    className="mt-4 w-full rounded-md overflow-hidden bg-muted flex items-center justify-center"
                >
                    {/* No src -> show clear error and guidance */}
                    {!src && (
                        <div className="p-4 text-center">
                            <div className="mb-2 font-medium text-red-600">Form not configured</div>
                            <div className="text-sm text-muted-foreground">
                                Pass <code>iframeUrl</code> or <code>iframeFormId</code> to this component.
                            </div>
                        </div>
                    )}

                    {/* Only render iframe when the dialog is open and we have a src (lazy load) */}
                    {src && open && (
                        <>
                            {/* iframe itself */}
                            <iframe
                                key={src} // ensure remount when src changes
                                title={title}
                                src={src}
                                style={{ width: "100%", height: "100%", border: 0 }}
                                allow={allow}
                                onLoad={() => {
                                    setLoading(false);
                                    setError(null);
                                }}
                                onError={() => {
                                    setLoading(false);
                                    setError("Failed to load the form. Please try again or open in a new tab.");
                                }}
                                // set loading true when iframe initially mounts
                                ref={(el) => {
                                    if (el) {
                                        // mark as loading when iframe is inserted
                                        setLoading(true);
                                        setError(null);
                                    }
                                }}
                            />

                            {/* Error / fallback UI on top */}
                            {error && (
                                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/80 p-4 text-center">
                                    <div className="mb-2 text-sm text-red-600">{error}</div>
                                    <div className="text-sm">
                                        You can also open the form directly:
                                        <div className="mt-2">
                                            <a
                                                href={src}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="underline"
                                            >
                                                Open form in a new tab
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
