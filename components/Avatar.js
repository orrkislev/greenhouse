import { userActions, useUser } from "@/utils/store/useUser";
import { ImageUp, Save } from "lucide-react";
import { useRef, useState } from "react";

export default function Avatar({ user, className, ...props }) {
    return (
        <div className={`border border-stone-300 w-8 h-8 rounded-full bg-stone-200 overflow-hidden relative flex items-center justify-center ${className}`} {...props}>
            <div className="text-sm text-stone-500">{user.first_name.charAt(0)}.{user.last_name.charAt(0)}</div>
            <div style={{ backgroundImage: `url(${user.avatar_url})` }} className="absolute w-full h-full bg-cover bg-center rounded-full" />
        </div>
    )
}

export function AvatarEdit() {
    const user = useUser((state) => state.user);
    const [image, setImage] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);
    if (!user) return null;

    const onFile = (file) => {
        if (file && (file.type === 'image/png' || file.type === 'image/jpg' || file.type === 'image/jpeg')) {
            setImage(file);
        }
    };

    const save = async () => {
        if (image) {
            await userActions.updateProfilePicture(image);
            setImage(null);
        }
    }
    
    const imgUrl = image ? URL.createObjectURL(image) : user.avatar_url;

    return (
        <div className="p-8 pb-2">
            <div className={`flex flex-col gap-2 items-center justify-center relative aspect-square border rounded-full transition-all ${isDragging ? 'border-blue-500 border-2 bg-blue-50' : 'border-stone-500 bg-stone-200'}`}
                onDragOver={e => {
                    e.preventDefault();
                }}
                onDragEnter={e => {
                    e.preventDefault();
                    setIsDragging(true);
                }}
                onDragLeave={e => {
                    e.preventDefault();
                    setIsDragging(false);
                }}
                onDrop={e => {
                    e.preventDefault();
                    setIsDragging(false);
                    onFile(e.dataTransfer.files[0]);
                }}
            >
                <div className="text-2xl text-stone-500">{user.first_name.charAt(0)}.{user.last_name.charAt(0)}</div>
                <div className="absolute w-full h-full bg-cover bg-center rounded-full" style={{ backgroundImage: `url(${imgUrl})` }} />
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png, image/jpeg, image/jpg"
                    className="hidden"
                    onChange={e => {
                        const file = e.target.files[0];
                        if (file) onFile(file);
                    }}
                    tabIndex={-1}
                />
                <div className="absolute top-0 right-0 flex items-center justify-center p-2 cursor-pointer bg-white border border-stone-500 text-stone-500 rounded-full"
                    onClick={e => {
                        e.preventDefault();
                        e.stopPropagation();
                        fileInputRef.current.click();
                    }}>
                    <ImageUp className="w-4 h-4" />
                </div>
                {image && (
                    <div className="absolute top-0 left-0 flex items-center justify-center p-2 cursor-pointer bg-white border border-stone-500 text-stone-500 rounded-full" onClick={save}>
                        <Save className="w-4 h-4" />
                    </div>
                )}
            </div>
        </div>
    );
}




export function AvatarGroup({ users }) {
    if (!users) return null;
    if (!Array.isArray(users)) return null
    if (users.length === 0) return null;

    return (
        <div className="flex flex-row-reverse">
            {users.map((user) => (
                <Avatar key={user.id} user={user} className='-mr-[50%] hover:z-10 scale-75' />
            ))}
        </div>
    )
}