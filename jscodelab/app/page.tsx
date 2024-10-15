'use client';
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import Image from "next/image"

const projects = [
  {
    title: "Web RTC Video",
    description: "A simple demo of a Web RTC video call implementation. Connect to a peer and start a video call.",
    url: "/webrtc-video",
    icon: "/webrtc-icon.png",
  },
  {
    title: "Event Planning App",
    description: "An AI assistant event planner with one stop shop marketplace for events. This uses Dart for front end, and uses Python for backend, plus some PHP.",
    url: "https://play.google.com/store/apps/details?id=com.the_black_pink_app&pli=1",
    icon: "/tierez.png",
  },
  {
    title: "Python Flask Protobuf Extension",
    description: "Flask-Protobuf is a Python package that provides integration between Flask and Protocol Buffers (protobuf). It allows you to easily handle incoming protobuf messages in your Flask application.",
    url: "https://github.com/Mackhintoshi/Flask-Protobuf",
    icon: "/flask-icon.png",
  },
  {
    title: "AI Interview Chatbot",
    description: "(took the backend down for now) An AI Interview Coach, that helps you practice your interview skill. The app is built in NextJS and uses a Flask with Redis. It integrates with ChatGPT to provide a chatbot experience.",
    url: "#",
    icon: "/botIcon250.png",
  },
  
  {
    title: "Girl Band News App",
    description: "(took this app down) This app allows you to access latest news about Blackpink from different sources, Choose your bias, Track how we are achieving our goals as Blinks. i.e How many views do we need to achieve? ,A simple plain screen that can be used on concerts if you do not have blink lights.",
    url: "https://play.google.com/store/apps/details?id=com.the_black_pink_app&pli=1",
    icon: "/blinkApp.png",
  },
]

export default function IndexPage() {
  return (
    <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
      <div className="flex max-w-[980px] flex-col items-start gap-2">
        <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
          Code Lab <br className="hidden sm:inline" />
          Personal Projects
        </h1>
       
      </div>
      <div className="grid grid-cols-1 items-start gap-2 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3
      ">
        {projects.map((project,index) => (
            <Card className="hover:shadow-primary cursor-pointer" key={index}>
              <CardHeader className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Image src={project.icon}
                  className="rounded-full text-justify"
                  width={100} height={100} alt="projectLogo"/>
                  <h2 className="text-xl font-bold">{project.title}</h2>
                </div>
              </CardHeader>
              <CardContent className="min-h-[120px]
              ">
                <p className="">
                  {project.description}
                </p>
                
              </CardContent>
              <CardFooter className="flex items-center justify-end">
                <Button className="h-12  w-1/2 border-2 border-blue-400 bg-white text-lg text-blue-500 hover:bg-blue-600 hover:text-white
                dark:border-blue-500 dark:bg-blue-500 dark:text-white dark:hover:bg-blue-600 dark:hover:text-white"
                onClick={() => window.open(project.url, "_blank")}
                >
                  Visit
                </Button>
              </CardFooter>
            </Card>
          ))}
       
      </div>
    </section>
  )
}
