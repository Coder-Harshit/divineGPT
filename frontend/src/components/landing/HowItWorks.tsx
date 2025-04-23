// "use client"
//
// import { motion } from "framer-motion"
// import { LucideBrainCircuit, LucideBookOpenCheck, LucideMic, LucideVolume2 } from "lucide-react"
//
// const steps = [
//     {
//         // icon: <LucideBookOpenCheck className="w-10 h-10 text-yellow-400" />,
//         icon: <LucideBookOpenCheck className="w-10 h-10 text-[var(--accent-yellow)]" />,
//         title: "Shloka Retrieval",
//         description: "DivineGPT matches your query with the most relevant shlokas from the Gita using advanced semantic search."
//     },
//     {
//         icon: <LucideBrainCircuit className="w-10 h-10 text-[var(--accent-yellow)]" />,
//         title: "Spiritual Reasoning",
//         description: "The AI interprets Krishna’s wisdom in a tone you choose – GenZ, mature, or neutral – grounded in scripture."
//     },
//     {
//         icon: <LucideMic className="w-10 h-10 text-[var(--accent-yellow)]" />,
//         title: "Speak to Krishna",
//         description: "Ask your questions using voice or text – DivineGPT understands both."
//     },
//     {
//         icon: <LucideVolume2 className="w-10 h-10 text-[var(--accent-yellow)]" />,
//         title: "Hear the Divine",
//         description: "Receive emotionally intelligent answers in soothing voice output, like Krishna himself is speaking."
//     }
// ]
//
// export default function HowItWorks() {
//     return (
//         // <section className="w-full py-20 px-6 bg-[#f8fafc] dark:bg-[#0f172a] text-gray-800 dark:text-gray-100">
//         <section className="w-full py-20 px-6 bg-[var(--bg-light)] dark:bg-[var(--bg-dark)] text-[var(--text-primary-light)] dark:text-[var(--text-primary-dark)]">
//             <div className="max-w-6xl mx-auto text-center space-y-10">
//                 <motion.h2
//                     initial={{ opacity: 0, y: 20 }}
//                     whileInView={{ opacity: 1, y: 0 }}
//                     viewport={{ once: true }}
//                     transition={{ duration: 0.6 }}
//                     className="text-4xl font-bold"
//                 >
//                     How DivineGPT Works
//                 </motion.h2>
//
//                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-10">
//                     {steps.map((step, i) => (
//                         <motion.div
//                             key={i}
//                             initial={{ opacity: 0, y: 30 }}
//                             whileInView={{ opacity: 1, y: 0 }}
//                             viewport={{ once: true }}
//                             transition={{ duration: 0.5, delay: i * 0.2 }}
//                             className="p-6 bg-[var(--card-light)] dark:bg-[var(--card-dark)] rounded-2xl shadow-xl space-y-4 text-left"
//                         >
//                             <div>{step.icon}</div>
//                             <h3 className="text-xl font-semibold">{step.title}</h3>
//                             <p className="text-[var(--text-secondary-light)] dark:text-[(--text-secondary-dark)]">{step.description}</p>
//                         </motion.div>
//                     ))}
//                 </div>
//             </div>
//         </section>
//     )
// }
"use client"

import { motion } from "framer-motion"
import { LucideBrainCircuit, LucideBookOpenCheck, LucideMic, LucideVolume2 } from "lucide-react"

const steps = [
    {
        icon: <LucideBookOpenCheck className="w-10 h-10 text-[var(--accent-saffron)]" />,
        title: "Shloka Retrieval",
        description: "DivineGPT matches your query with the most relevant shlokas from the Gita using advanced semantic search."
    },
    {
        icon: <LucideBrainCircuit className="w-10 h-10 text-[var(--primary)]" />,
        title: "Spiritual Reasoning",
        description: "The AI interprets Krishna's wisdom in a tone you choose – GenZ, mature, or neutral – grounded in scripture."
    },
    {
        icon: <LucideMic className="w-10 h-10 text-[var(--accent-blue)]" />,
        title: "Speak to Krishna",
        description: "Ask your questions using voice or text – DivineGPT understands both."
    },
    {
        icon: <LucideVolume2 className="w-10 h-10 text-[var(--accent-gold)]" />,
        title: "Hear the Divine",
        description: "Receive emotionally intelligent answers in soothing voice output, like Krishna himself is speaking."
    }
]

export default function HowItWorks() {
    return (
        <section className="w-full py-20 px-6 bg-[var(--bg-light)] dark:bg-[var(--bg-dark)] text-[var(--text-primary-light)] dark:text-[var(--text-primary-dark)]">
            <div className="max-w-6xl mx-auto text-center space-y-10">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-4xl font-bold"
                >
                    How DivineGPT Works
                </motion.h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-10">
                    {steps.map((step, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.2 }}
                            className="p-6 bg-[var(--card-light)] dark:bg-[var(--card-dark)] rounded-2xl shadow-xl space-y-4 text-left"
                        >
                            <div>{step.icon}</div>
                            <h3 className="text-xl font-semibold">{step.title}</h3>
                            <p className="text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)]">{step.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}