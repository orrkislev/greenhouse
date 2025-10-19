import { userActions, useUser } from "@/utils/store/useUser";
import { tw } from "@/utils/tw";
import { ImageUp, Save } from "lucide-react";
import { useRef, useState } from "react";

export default function Avatar({ user, className, hoverScale = true, ...props }) {
    return (
        <div className={`border border-stone-300 w-8 h-8 rounded-full bg-stone-200 relative flex items-center justify-center transition-transform duration-150 ${hoverScale ? 'group/avatar hover:scale-150 grayscale-50 hover:grayscale-0' : ''} ${className}`} {...props}>
            <div className="text-sm text-stone-500">{user.first_name.charAt(0)}.{user.last_name.charAt(0)}</div>
            <div style={{ backgroundImage: `url(${user.avatar_url})` }} className="absolute w-full h-full bg-cover bg-center rounded-full" />
            <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-[90%] opacity-0 group-hover/avatar:-translate-y-[105%] text-center bg-white group-hover/avatar:opacity-100 transition-all duration-300"
                style={{ fontSize: '0.6rem', lineHeight: '0.5rem' }} >
                {user.first_name} {user.last_name}
            </div>
        </div>
    )
}

export function AvatarEdit() {
    const user = useUser((state) => state.user);
    const [image, setImage] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);
    if (!user) return null;

    const onFile = async (file) => {
        if (file && (file.type === 'image/png' || file.type === 'image/jpg' || file.type === 'image/jpeg')) {
            await userActions.updateProfilePicture(file);
            setImage(file);
        }
    };

    const imgUrl = image ? URL.createObjectURL(image) : user.avatar_url;

    return (
        <div className="p-8 pb-2 w-full" >
            <div className={`group/edit-avatar flex flex-col gap-2 items-center justify-center relative aspect-square border rounded-full transition-all ${isDragging ? 'border-blue-500 border-2 bg-blue-50' : 'border-stone-500 bg-stone-200'}`}
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
                <div className="absolute top-1/2 right-1/2 translate-x-1/2 -translate-y-1/2 opacity-0 group-hover/edit-avatar:opacity-100 transition-all duration-300 flex items-center justify-center p-2 cursor-pointer bg-white text-stone-500 rounded-full"
                    onClick={e => {
                        e.preventDefault();
                        e.stopPropagation();
                        fileInputRef.current.click();
                    }}>
                    <ImageUp className="w-4 h-4" />
                </div>
            </div>
        </div>
    );
}



const GroupAvatarItem = tw`group -ml-[12px] hover:z-[100]`

export function AvatarGroup({ users, className }) {
    if (!users) return null;
    if (!Array.isArray(users)) return null
    if (users.length === 0) return null;

    return (
        <div className={`flex items-center translate-x-[12px] ${className}`}>
            {users.map((user, idx) => (
                <GroupAvatarItem key={user.id} $idx={idx}>
                    <Avatar user={user}/>
                </GroupAvatarItem>
            ))}
        </div>
    )
}