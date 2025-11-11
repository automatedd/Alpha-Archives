import ThankHero from "@/components/thank";
import { Suspense } from "react";
export default function ThankYou() {
    return (
        <Suspense fallback={<div>Loading your details...</div>}>
            <ThankHero />
        </Suspense>
    );
}
