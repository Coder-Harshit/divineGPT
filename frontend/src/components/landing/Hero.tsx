// "use client"
//
// import { motion } from "framer-motion"
//
// export default function Hero() {
//     return (
//         <section className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-[#000814] via-[#001d3d] to-[#003566] text-white px-6">
//             <div className="max-w-4xl text-center space-y-6">
//                 <motion.h1
//                     initial={{ opacity: 0, y: -40 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     transition={{ duration: 1 }}
//                     className="text-5xl sm:text-6xl font-bold leading-tight"
//                 >
//                     DivineGPT
//                 </motion.h1>
//                 <motion.p
//                     initial={{ opacity: 0 }}
//                     animate={{ opacity: 1 }}
//                     transition={{ delay: 0.3, duration: 1 }}
//                     className="text-xl sm:text-2xl text-blue-100"
//                 >
//                     Your spiritual guide, your digital Krishna. Talk. Reflect. Transform.
//                 </motion.p>
//                 <motion.button
//                     initial={{ opacity: 0, scale: 0.9 }}
//                     animate={{ opacity: 1, scale: 1 }}
//                     transition={{ delay: 0.6, duration: 0.5 }}
//                     className="px-6 py-3 bg-yellow-500 text-black rounded-full font-medium shadow-lg hover:bg-yellow-400 transition"
//                 >
//                     Start Your Journey
//                 </motion.button>
//             </div>
//         </section>
//     )
// }
"use client"

import { motion } from "framer-motion"
import {LucideArrowDown} from "lucide-react";

export default function Hero() {
    return (
        <section className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--bg-dark)] via-[var(--primary-deep)] to-[var(--primary)] text-[var(--text-primary-dark)] px-6">
            <div className="max-w-4xl text-center space-y-6">
                <motion.h1
                    initial={{ opacity: 0, y: -40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                    className="text-5xl sm:text-6xl font-bold leading-tight text-[var(--accent-gold)]"
                >
                    DivineGPT
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 1 }}
                    className="text-xl sm:text-2xl text-[var(--text-primary-dark)]"
                >
                    Your spiritual guide, your digital Krishna. Talk. Reflect. Transform.
                </motion.p>
                <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    className="px-6 py-3 bg-[var(--accent-saffron)] text-[var(--text-primary-light)] rounded-full font-medium shadow-lg hover:bg-[var(--accent-gold)] transition"
                >
                    Explore More
                </motion.button>
            </div>
        </section>
    )
}