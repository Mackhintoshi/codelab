'use client';
import Link from "next/link"

import { useState } from "react";
import PreStartVideoPreview from "./components/preStartVideoPreview";

export default function IndexPage() {
    const [started, setStarted] = useState(false);

    const onStartPeerToPeer = (candidates:RTCIceCandidate[]) => {
        console.log(candidates)
    }
  return (
    <>
    <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
      <div className="flex max-w-[980px] flex-col items-start gap-2">
        <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
          Web Rtc Video <br className="hidden sm:inline" />
          Test Web RTC implementation
        </h1>

      </div>

    </section>

    
    {
        !started?
        <section className="container grid items-center gap-6 pb-8 pt-6 sm:grid-cols-1 md:grid-cols-1 md:py-10">
                <PreStartVideoPreview/>
            
        </section>:
        <></>
    }
    
    </>
  )
}
