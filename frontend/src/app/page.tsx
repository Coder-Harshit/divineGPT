import Layout from "@/components/Layout";
import Hero from "@/components/landing/Hero"
import HowItWorks from "@/components/landing/HowItWorks";
import WhyDivineGPT from "@/components/landing/WhyDivineGPT";
import Testimonials from "@/components/Testimonials";
import CallToAction from "@/components/CallToAction";
// import Features from "@/components/Features";

export default function Home() {
    return(
        <Layout>
            <Hero />
            <HowItWorks />
            <WhyDivineGPT />
            <Testimonials />
            {/*<Features />*/}
        {/*    Merge the sections: Features & WhyDivineGPT */}
            <CallToAction/>
        </Layout>
    )
}