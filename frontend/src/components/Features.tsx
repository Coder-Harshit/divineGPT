// 'use client'
//
// import { motion } from 'framer-motion'
// import { Sparkles, Headphones, Brain, Volume2 } from 'lucide-react'
//
// const features = [
//     {
//         icon: <Sparkles className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />,
//         title: 'Spiritual Insights',
//         desc: 'Contextual guidance from Bhagavad Gita—real conversations, real clarity.',
//     },
//     {
//         icon: <Brain className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />,
//         title: 'Emotionally Aware AI',
//         desc: 'Feels your mood. Responds with empathy. Grows with you.',
//     },
//     {
//         icon: <Headphones className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />,
//         title: 'Voice Interaction',
//         desc: 'Talk like you would to a friend—DivineGPT listens and replies in voice.',
//     },
//     {
//         icon: <Volume2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />,
//         title: 'Multi-tone Guidance',
//         desc: 'Choose how Krishna talks to you—gen-z, mature, or poetic.',
//     },
// ]
//
// export default function Features() {
//     return (
//         <section className="py-20 bg-white dark:bg-slate-950">
//             <div className="max-w-6xl mx-auto px-6">
//                 <div className="text-center mb-12">
//                     <h2 className="text-3xl font-bold">Why DivineGPT?</h2>
//                     <p className="text-gray-600 dark:text-gray-400">
//                         Not just answers—*awakening*. Here’s what makes DivineGPT more than just AI.
//                     </p>
//                 </div>
//
//                 <div className="grid gap-10 md:grid-cols-2">
//                     {features.map((f, i) => (
//                         <motion.div
//                             key={i}
//                             initial={{ opacity: 0, y: 30 }}
//                             whileInView={{ opacity: 1, y: 0 }}
//                             transition={{ duration: 0.4, delay: i * 0.2 }}
//                             className="flex items-start gap-4"
//                         >
//                             <div className="flex-shrink-0">{f.icon}</div>
//                             <div>
//                                 <h3 className="text-lg font-semibold">{f.title}</h3>
//                                 <p className="text-gray-600 dark:text-gray-400">{f.desc}</p>
//                             </div>
//                         </motion.div>
//                     ))}
//                 </div>
//             </div>
//         </section>
//     )
// }
'use client'

import { motion } from 'framer-motion'
import { Sparkles, Headphones, Brain, Volume2 } from 'lucide-react'

const features = [
    {
        icon: <Sparkles className="w-6 h-6 text-[var(--accent-saffron)]" />,
        title: 'Spiritual Insights',
        desc: 'Contextual guidance from Bhagavad Gita—real conversations, real clarity.',
    },
    {
        icon: <Brain className="w-6 h-6 text-[var(--primary)]" />,
        title: 'Emotionally Aware AI',
        desc: 'Feels your mood. Responds with empathy. Grows with you.',
    },
    {
        icon: <Headphones className="w-6 h-6 text-[var(--accent-blue)]" />,
        title: 'Voice Interaction',
        desc: 'Talk like you would to a friend—DivineGPT listens and replies in voice.',
    },
    {
        icon: <Volume2 className="w-6 h-6 text-[var(--accent-gold)]" />,
        title: 'Multi-tone Guidance',
        desc: 'Choose how Krishna talks to you—gen-z, mature, or poetic.',
    },
]

export default function Features() {
    return (
        <section className="py-20 bg-[var(--card-light)] dark:bg-[var(--bg-dark)]">
            <div className="max-w-6xl mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold">Why DivineGPT?</h2>
                    <p className="text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)]">
                        Not just answers—*awakening*. Here's what makes DivineGPT more than just AI.
                    </p>
                </div>

                <div className="grid gap-10 md:grid-cols-2">
                    {features.map((f, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: i * 0.2 }}
                            className="flex items-start gap-4"
                        >
                            <div className="flex-shrink-0">{f.icon}</div>
                            <div>
                                <h3 className="text-lg font-semibold">{f.title}</h3>
                                <p className="text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)]">{f.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}