// export default function CallToAction() {
//     return (
//         <section className="bg-gradient-to-b from-[#0f0c29] via-[#302b63] to-[#24243e] text-white py-16 px-4 sm:px-8 md:px-16 lg:px-24">
//             <div className="max-w-4xl mx-auto text-center">
//                 <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-[#d1aaff] drop-shadow-lg">
//                     Ready to transform your inner world?
//                 </h2>
//                 <p className="text-lg sm:text-xl mb-8 text-gray-300">
//                     Let Krishna’s wisdom guide your modern dilemmas. No matter your question, find calm, clarity, and courage—one divine chat at a time.
//                 </p>
//                 <a
//                     href="#chat"
//                     className="inline-block bg-gradient-to-r from-[#7f5af0] to-[#a78bfa] text-white px-8 py-3 text-lg font-semibold rounded-2xl shadow-md hover:scale-105 transition-transform duration-300"
//                 >
//                     Start your journey
//                 </a>
//             </div>
//         </section>
//     );
// }
export default function CallToAction() {
    return (
        <section className="bg-gradient-to-b from-[var(--bg-dark)] via-[var(--primary)] to-[var(--primary-light)] text-white py-16 px-4 sm:px-8 md:px-16 lg:px-24">
            <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-[var(--accent-gold)] drop-shadow-lg">
                    Ready to transform your inner world?
                </h2>
                <p className="text-lg sm:text-xl mb-8 text-[var(--text-primary-dark)]">
                    Let Krishna's wisdom guide your modern dilemmas. No matter your question, find calm, clarity, and courage—one divine chat at a time.
                </p>
                <a
                    href="#chat"
                    className="inline-block bg-gradient-to-r from-[var(--accent-saffron)] to-[var(--accent-gold)] text-[var(--text-primary-light)] px-8 py-3 text-lg font-semibold rounded-2xl shadow-md hover:scale-105 transition-transform duration-300"
                >
                    Start your journey
                </a>
            </div>
        </section>
    );
}