import { studyActions, useStudy } from "@/utils/store/useStudy"
import { motion } from "motion/react"
import Link from "next/link"
import { useState } from "react"

export default function StudyMain() {
	const paths = useStudy(state => state.paths)

	return (
		<div className="flex flex-col gap-8 mt-8">
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				{paths.map(path => (
					<Link key={path.id} href={`/study?id=${path.id}`}>
						{/* <Box2 label={path.title} labelIcon={BookOpen} > */}
							<StudyPathCard path={path} />
						{/* </Box2> */}
					</Link>
				))}
			</div>

			<div className="flex">
				<NewLearningPathCard />
			</div>
		</div>
	)
}

export function NewLearningPathCard() {
	const [hovered, setHovered] = useState(false);

	return (
		<div
			className={`flex ${hovered ? "flex-col-reverse" : "flex-col"} min-w-[300px] rounded-lg border border-lime-500 bg-lime-500 cursor-pointer overflow-hidden transition-colors duration-300 hover:bg-lime-600`}
			onClick={() => studyActions.addPath()}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
		>
			<motion.div
				layout
				transition={{ type: "spring", stiffness: 500, damping: 35 }}
				style={{ backgroundImage: `url(/images/question.png)` }}
				className="h-full bg-cover bg-center rounded-md aspect-[7/3]"
			/>
			<motion.div
				layout
				transition={{ type: "spring", stiffness: 500, damping: 35 }}
				className="font-bold text-white p-2 text-center"
			>
				מסלול למידה חדש
			</motion.div>
		</div>
	);
}


export function StudyPathCard({path,}) {
	const [hovered, setHovered] = useState(false);

	return (
		<div
			className={`flex ${hovered ? "flex-col-reverse" : "flex-col"} min-w-[300px] rounded-lg border border-orange-500 bg-orange-500 cursor-pointer overflow-hidden transition-colors duration-300 hover:bg-orange-600`}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
		>
			<motion.div
				layout
				transition={{ type: "spring", stiffness: 500, damping: 35 }}
				style={{ backgroundImage: `url(${path.metadata?.image || '/images/study.png'})` }}
				className="h-full bg-cover bg-center rounded-md aspect-[7/3]"
			/>
			<motion.div
				layout
				transition={{ type: "spring", stiffness: 500, damping: 35 }}
				className="font-bold text-white p-2 text-center"
			>
				{path.title}
			</motion.div>
		</div>
	);
}

function StudyPathCard2({ path, ...props }) {
	const step = path?.steps?.find(step => step.status == 'todo');
	return (
		<div className="w-full flex gap-4 min-h-[200px]" {...props}>
			<div className="flex-1">
				<div
					style={{ backgroundImage: `url(${path ? (path.metadata?.image || '/images/study.png') : '/images/question.png'})` }}
					className={`h-full bg-cover bg-center rounded-md border border-stone-200 transition-all duration-300`} />
			</div>
			<div className="flex flex-col gap-2 flex-1 justify-center">
				<div className="text-lg font-bold">{path ? path.title : 'איזה תחום מענין אותי ללמוד?'}</div>
				<div className="text-sm text-stone-500">{path ? path.description : 'מה בעצם אני רוצה ללמוד?'}</div>
				{step && <div className="text-sm text-stone-500">{step.title}</div>}
			</div>
		</div>
	)
}