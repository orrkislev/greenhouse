import { REGEXP_ONLY_DIGITS } from "input-otp";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "./input-otp";

export default function PINInput({ onChange, value, hideInput=false, withLabel=true}) {

    return (
        <div>
            {withLabel && <label className="block text-sm font-medium mb-1">סיסמא</label>}
            <InputOTP
                maxLength={4}
                value={value}
                onChange={v => onChange({target: { value: v }})}
                hideInput={hideInput}
                pattern={REGEXP_ONLY_DIGITS}
            >
                <InputOTPGroup className="ltr">
                    <InputOTPSlot index={0} className="bg-white" />
                    <InputOTPSlot index={1} className="bg-white" />
                    <InputOTPSlot index={2} className="bg-white" />
                    <InputOTPSlot index={3} className="bg-white" />
                </InputOTPGroup>
            </InputOTP>
        </div>
    )
}