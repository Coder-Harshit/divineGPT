// "use client"
//
// import { motion } from "framer-motion"
// import {
//     LucideHeartHandshake,
//     LucideLanguages,
//     LucideUserCheck,
//     LucideSparkles
// } from "lucide-react"
//
// const features = [
//     {
//         icon: <LucideHeartHandshake className="w-10 h-10 text-pink-500" />,
//         title: "Emotionally Intelligent",
//         description: "Unlike generic bots, DivineGPT listens deeply and responds with empathy grounded in the Gita."
//     },
//     {
//         icon: <LucideLanguages className="w-10 h-10 text-purple-500" />,
//         title: "Multilingual Wisdom",
//         description: "Speak in English or Hindi – receive wisdom that matches your cultural and emotional context."
//     },
//     {
//         icon: <LucideUserCheck className="w-10 h-10 text-green-500" />,
//         title: "Personalized Guidance",
//         description: "Your tone, your vibe – DivineGPT adapts to GenZ, mature, or neutral speech modes seamlessly."
//     },
//     {
//         icon: <LucideSparkles className="w-10 h-10 text-yellow-500" />,
//         title: "Scripturally Grounded",
//         description: "Every insight is backed by a real shloka. This is not AI bluff – it’s Bhagavad Gita verified."
//     }
// ]
//
// export default function WhyDivineGPT() {
//     return (
//         <section className="w-full py-20 px-6 bg-white dark:bg-[#020617] text-gray-900 dark:text-gray-100">
//             <div className="max-w-6xl mx-auto text-center space-y-12">
//                 <motion.h2
//                     initial={{ opacity: 0, y: 20 }}
//                     whileInView={{ opacity: 1, y: 0 }}
//                     viewport={{ once: true }}
//                     transition={{ duration: 0.6 }}
//                     className="text-4xl font-bold"
//                 >
//                     Why DivineGPT?
//                 </motion.h2>
//
//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-10">
//                     {features.map((feature, i) => (
//                         <motion.div
//                             key={i}
//                             initial={{ opacity: 0, y: 30 }}
//                             whileInView={{ opacity: 1, y: 0 }}
//                             viewport={{ once: true }}
//                             transition={{ duration: 0.5, delay: i * 0.2 }}
//                             className="group p-6 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 shadow-xl hover:shadow-2xl transition-shadow duration-300"
//                         >
//                             <div className="mb-4">{feature.icon}</div>
//                             <h3 className="text-xl font-semibold group-hover:underline underline-offset-4 transition-all duration-300">
//                                 {feature.title}
//                             </h3>
//                             <p className="text-gray-600 dark:text-gray-300 mt-2">{feature.description}</p>
//                         </motion.div>
//                     ))}
//                 </div>
//             </div>
//         </section>
//     )
// }

"use client"

import { motion } from "framer-motion"
import {
    LucideHeartHandshake,
    LucideLanguages,
    LucideUserCheck,
    LucideSparkles
} from "lucide-react"

const features = [
    {
        icon: <LucideHeartHandshake className="w-10 h-10 text-[var(--accent-pink)]" />,
        title: "Emotionally Intelligent",
        description: "Unlike generic bots, DivineGPT listens deeply and responds with empathy grounded in the Gita."
    },
    {
        icon: <LucideLanguages className="w-10 h-10 text-[var(--primary)]" />,
        title: "Multilingual Wisdom",
        description: "Speak in English or Hindi – receive wisdom that matches your cultural and emotional context."
    },
    {
        icon: <LucideUserCheck className="w-10 h-10 text-[var(--accent-blue)]" />,
        title: "Personalized Guidance",
        description: "Your tone, your vibe – DivineGPT adapts to GenZ, mature, or neutral speech modes seamlessly."
    },
    {
        icon: <LucideSparkles className="w-10 h-10 text-[var(--accent-saffron)]" />,
        title: "Scripturally Grounded",
        description: "Every insight is backed by a real shloka. This is not AI bluff – it's Bhagavad Gita verified."
    }
]

export default function WhyDivineGPT() {
    return (
        <section className="w-full py-20 px-6 bg-[var(--bg-light)] dark:bg-[var(--bg-dark)] text-[var(--text-primary-light)] dark:text-[var(--text-primary-dark)]">
            <div className="max-w-6xl mx-auto text-center space-y-12">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-4xl font-bold"
                >
                    Why DivineGPT?
                </motion.h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-10">
                    {features.map((feature, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.2 }}
                            className="group p-6 rounded-2xl bg-[var(--card-light)] dark:bg-[var(--card-dark)] shadow-xl hover:shadow-2xl transition-shadow duration-300"
                        >
                            <div className="mb-4">{feature.icon}</div>
                            <h3 className="text-xl font-semibold transition-all duration-300">
                                {feature.title}
                            </h3>
                            <p className="text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)] mt-2">{feature.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}