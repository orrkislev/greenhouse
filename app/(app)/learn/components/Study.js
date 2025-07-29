import { tw } from "@/utils/tw";

const StudyContainer = tw`flex flex-col gap-4`;

export default function Study() {
    return (
        <StudyContainer>
            <div>הלימוד שלי</div>
        </StudyContainer>
    )
}