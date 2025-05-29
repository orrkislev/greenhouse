import { InputOTP, InputOTPGroup, InputOTPSlot } from "./input-otp";

export default function PINInput({ onChange }) {

    return (
        <InputOTP
            maxLength={4}
            onChange={onChange}
        >
            <InputOTPGroup className="ltr">
                <InputOTPSlot index={0} className="bg-white"/>
                <InputOTPSlot index={1} className="bg-white"/>
                <InputOTPSlot index={2} className="bg-white"/>
                <InputOTPSlot index={3} className="bg-white"/>
            </InputOTPGroup>
        </InputOTP>
    )
}