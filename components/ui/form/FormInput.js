import { useState } from "react";
import { Input } from "../input";

export function useForm(initial, onSubmit) {
    const [values, setValues] = useState(initial);
    const [error, setError] = useState(null);

    const populate = (newValues) => {
        setValues(prevValues => ({
            ...prevValues,
            ...newValues
        }));
    };

    const clear = () => {
        setValues(initial);
    }

    const props = Object.keys(values).reduce((acc, key) => {
        acc[key] = {
            value: values[key],
            onChange: (e) => {
                setValues(prevValues => ({
                    ...prevValues,
                    [key]: e.target.value
                }));
            }
        };
        return acc;
    }, {});

    const setValue = (key, value) => {
        if (!values.hasOwnProperty(key)) return;
        if (!value || value === null || value === undefined) return;
        if (values[key] === value) return;
        
        setValues(prevValues => ({
            ...prevValues,
            [key]: value
        }));
    };

    return {
        values, setValue,
        populate,
        clear,
        props,
        formProps: {
            onSubmit: async (e) => {
                e.preventDefault();
                try{
                    await onSubmit(values);
                } catch (err) {
                    setError(err.message);
                }
            }
        },
    };
}

export function FormInput(props) {
    return (
        <div>
            {props.label && <label className="block text-sm font-medium mb-1">{props.label}</label>}
            <Input {...props} />
        </div>
    )
}