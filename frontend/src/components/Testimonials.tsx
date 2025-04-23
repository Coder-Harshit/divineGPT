// 'use client'
//
// import { motion } from 'framer-motion'
// import { MessageSquareQuote } from 'lucide-react'
//
// const testimonials = [
//     {
//         name: 'Aryan Sharma',
//         role: 'Startup Founder',
//         quote: 'DivineGPT isn’t just an AI—it’s my morning meditation partner. Feels like I’m talking to a wise friend.',
//     },
//     {
//         name: 'Priya Desai',
//         role: 'Student @ DU',
//         quote: 'When college stress hits, DivineGPT’s words bring me instant clarity. Truly next level!',
//     },
//     {
//         name: 'Anjali Iyer',
//         role: 'Spiritual Blogger',
//         quote: 'The shlokas aren’t just texts here—they breathe, they speak, they *guide*. Loved the vibe!',
//     },
// ]
//
// export default function Testimonials() {
//     return (
//         <section className="py-20 bg-gray-100 dark:bg-slate-900">
//             <div className="max-w-5xl mx-auto px-6">
//                 <div className="text-center mb-12">
//                     <MessageSquareQuote className="mx-auto h-10 w-10 text-indigo-600 dark:text-indigo-400" />
//                     <h2 className="text-3xl font-bold mt-4">Voices of Transformation</h2>
//                     <p className="text-gray-600 dark:text-gray-400">
//                         Hear how DivineGPT is changing lives—one soul, one chat at a time.
//                     </p>
//                 </div>
//
//                 <div className="grid gap-8 md:grid-cols-3">
//                     {testimonials.map((t, i) => (
//                         <motion.div
//                             key={i}
//                             initial={{ opacity: 0, y: 30 }}
//                             whileInView={{ opacity: 1, y: 0 }}
//                             transition={{ duration: 0.5, delay: i * 0.2 }}
//                             className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-md"
//                         >
//                             <p className="text-lg italic mb-6 h-25">“{t.quote}”</p>
//                             <div className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mb-1">
//                                 {t.name}
//                             </div>
//                             <div className="text-sm text-gray-500 dark:text-gray-400">{t.role}</div>
//                         </motion.div>
//                     ))}
//                 </div>
//             </div>
//         </section>
//     )
// }
'use client'

import {motion} from 'framer-motion'
import {MessageSquareQuote} from 'lucide-react'

const testimonials = [
    {
        name: "Aryan Sharma",
        role: "Startup Founder",
        quote: "DivineGPT isn't just an AI—it's my morning meditation partner. Feels like I'm talking to a wise friend.",
    },
    {
        name: "Priya Desai",
        role: "Student @ DU",
        quote: "When college stress hits, DivineGPT's words bring me instant clarity. Truly next level!",
    },
    {
        name: "Anjali Iyer",
        role: "Spiritual Blogger",
        quote: "The shlokas aren't just texts here—they breathe, they speak, they *guide*. Loved the vibe!",
    },
]

export default function Testimonials() {
    return (
        <section className="py-20 bg-[var(--bg-light)] dark:bg-[var(--bg-dark)]">
            <div className="max-w-5xl mx-auto px-6">
                <div className="text-center mb-12">
                    <MessageSquareQuote className="mx-auto h-10 w-10 text-[var(--primary)]"/>
                    <h2 className="text-3xl font-bold mt-4">Voices of Transformation</h2>
                    <p className="text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)]">
                        Hear how DivineGPT is changing lives—one soul, one chat at a time.
                    </p>
                </div>

                <div className="grid gap-8 md:grid-cols-3">
                    {testimonials.map((t, i) => (
                        <motion.div
                            key={i}
                            initial={{opacity: 0, y: 30}}
                            whileInView={{opacity: 1, y: 0}}
                            transition={{duration: 0.5, delay: i * 0.2}}
                            className="bg-[var(--card-light)] dark:bg-[var(--card-dark)] rounded-2xl p-6 shadow-xl"
                        >
                            <p className="text-lg italic mb-6 h-25">"{t.quote}"</p>
                            <div className="text-sm font-semibold text-[var(--primary)]">
                                {t.name}
                            </div>
                            <div
                                className="text-sm text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)]">{t.role}</div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}