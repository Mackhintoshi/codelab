import Link from "next/link"

import { siteConfig } from "@/config/site"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import Image from "next/image"

export default function IndexPage() {
  return (
    <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
      <div className="flex max-w-[980px] flex-col items-start gap-2">
        <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
          Code Lab <br className="hidden sm:inline" />
          Practice Environment
        </h1>
       
      </div>
      <div className="grid grid-cols-1 items-start gap-2 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3
      ">
        <Card className="hover:shadow-primary cursor-pointer">
          <CardHeader className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Image src="/webrtc-icon.png"
              className="rounded-full text-justify"
              width={32} height={32} alt="WebRTC"/>
              <h2 className="text-xl font-bold">Web RTC Video Call Demo</h2>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-primary">
              A simple demo of a Web RTC video call implementation
            </p>
            
          </CardContent>
          <CardFooter className="flex items-center justify-end">
            <Button className="w-1/2 border-2 border-blue-400 bg-white text-blue-500 hover:bg-blue-600 hover:text-white">
              <Link href="/webrtc-video">View Demo</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="hover:shadow-primary cursor-pointer">
          <CardHeader className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Image src="/botIcon250.png"
              className="rounded-full text-justify"
              width={32} height={32} alt="WebRTC"/>
              <h2 className="text-xl font-bold">AI Interview Chatbot</h2>
            </div>
          </CardHeader>
          <CardContent>
          <p className="text-primary">
              An AI Interview Coach, that helps you practice your interview skills
            </p>
            
          </CardContent>
          <CardFooter className="flex items-center justify-end">
            <Button className="w-1/2 border-2 border-blue-400 bg-white text-blue-500 hover:bg-blue-600 hover:text-white">
              <Link href="https://reertalk.com/" target="_blank">View Demo</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </section>
  )
}
