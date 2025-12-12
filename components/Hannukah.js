import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink, X } from "lucide-react";
import { useState } from "react";

const random = (a = 1, b = 0) => Math.random() * (a - b) + b

export default function Hannukah() {
    const [open, setOpen] = useState(true);

    let filenames = ['1.png', '2.png', '3.png', '4.png', '5.png', '6.png', '7.png', '8.png', '9.png', '10.png', '11.png']
    filenames.sort(() => Math.random() - 0.5)
    const images = []
    for (let i = 0; i < 100; i++) {
        const filename = filenames[Math.floor(random(filenames.length))]
        const x = random(-10, 110)
        const y = random(-10, 110)
        const x2 = random() < .5 ? -10 : 110
        const y2 = random() < .5 ? -10 : 110
        images.push((
            <motion.svg className='absolute w-64 top-0 left-0 iconimg' key={i}
                initial={{ x: `${x2}vw`, y: `${y2}vh` }}
                animate={{ x: `${x}vw`, y: `${y}vh`, rotate: random(-50, 50) }}
                exit={{ x: `${x2}vw`, y: `${y2}vh` }}
                transition={{ delay: 1 + i * .01, duration: .4, ease: 'backInOut' }}

            >
                <svg>
                    <image href={`/images/hanukkah/${filename}`} x="0" y="0" width="128" height="128" filter="url(#innerStroke)" />
                </svg>
            </motion.svg>
        ))
    }

    return (
        <div className='fixed z-50 inset-0'>

            <svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <filter id="innerStroke" colorInterpolationFilters="sRGB" x="-50%" y="-50%" width="200%" height="200%">
                        <feMorphology in="SourceAlpha" operator="dilate" radius="6" result="dilated" />
                        <feFlood floodColor="white" result="whiteColor" />
                        <feComposite in="whiteColor" in2="dilated" operator="in" result="whiteStroke" />
                        <feDropShadow in="whiteStroke" dx="4" dy="4" stdDeviation="3" floodColor="rgba(0,0,0,0.5)" result="shadowedStroke" />
                        <feComposite in="SourceGraphic" in2="shadowedStroke" operator="over" result="final" />
                    </filter>
                </defs>
            </svg>

            <AnimatePresence>
                {open && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
                            className='absolute inset-0 bg-black/20 backdrop-blur-xs'
                        />
                        {images}
                        <motion.div
                            initial={{ y: '-100vh' }} animate={{ y: 0 }} exit={{ y: '-100vh' }} transition={{ duration: 1, delay: 1.5, ease: 'backInOut' }}
                            className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 hover:scale-110 transition-all'
                        >
                            <div className='relative bg-yellow-300 py-12 px-24 shadow-[3px_8px_0px_0_rgba(0,0,0,1)] titlebg border-2 border-black -rotate-1'>
                                <div className='text-6xl font-black font-sans flex gap-2 tracking-tighter '>
                                    <span className='title1'>האקתון</span>
                                    <span className='title2 bg-black text-white text-stroke-white px-1 rotate-2'>חנוכה</span>
                                </div>
                                <Link href='https://hamama-hackathon-app.firebaseapp.com/login'>
                                    <div className='px-6 py-4 bg-white border-2 border-black shadow-[2px_5px_0px_0_rgba(0,0,0,1)] mt-4 text-center font-black font-sans text-2xl hover:bg-black hover:text-white hover:-translate-y-1 transition-all'>
                                        אומייגאד האקתון
                                        <ExternalLink className='inline w-6 h-6 mr-6' />
                                    </div>
                                </Link>
                                <button className='absolute -top-4 -right-6 bg-white p-2 border-2 border-black -rotate-1 rounded-full group/close hover:bg-black hover:text-white hover:-translate-y-1 transition-all cursor-pointer' onClick={() => setOpen(false)}>
                                    <X className='w-6 h-6 group-hover/close:rotate-90 transition-all' />
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>





            <style jsx>{`
                .titlebg{
                    background-image: radial-gradient(#00000011 3px, transparent 3px);
                    background-size: 20px 20px;
                }
                .title1 {
                    -webkit-text-stroke: 2px black;
                }
                .title2 {
                    -webkit-text-stroke: 2px white;
                }
            `}</style>
        </div>
    )
}