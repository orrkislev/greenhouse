import { userActions, useUser } from "@/utils/store/useUser";
import { ImageUp, Save } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export default function Avatar({ user, userId, className, ...props }) {
    const [userData, setUserData] = useState(user);

    useEffect(() => {
        if (!user && userId) {
            userActions.getUserData(userId).then(setUserData);
        }
        if (user) setUserData(user);
    }, [user, userId])

    let avatarContent = null;
    if (userData) {
        if (userData.profilePicture) {
            avatarContent = <div style={{ backgroundImage: `url(${userData.profilePicture})` }} className="w-full h-full bg-cover bg-center rounded-full" />
        } else if (userData.first_name && userData.last_name) {
            avatarContent = <div className="text-sm text-stone-500">{userData.first_name.charAt(0)}.{userData.last_name.charAt(0)}</div>
        }
    }

    return (
        <div className={`border border-stone-300 w-8 h-8 rounded-full bg-stone-200 overflow-hidden flex items-center justify-center ${className}`} {...props}>
            {avatarContent}
        </div>
    )
}

export function AvatarEdit() {
    const user = useUser((state) => state.user);
    const [image, setImage] = useState(null);
    const fileInputRef = useRef(null);
    if (!user) return null;

    let avatarContent = null;
    if (user.profilePicture) {
        avatarContent = <div style={{ backgroundImage: `url(${user.profilePicture})` }} className="absolute top-2 left-2 right-2 bottom-2 bg-cover bg-center rounded-full" />
    } else if (user.first_name && user.last_name) {
        avatarContent = <div className="text-2xl text-stone-500">{user.first_name.charAt(0)}.{user.last_name.charAt(0)}</div>
    }

    if (image) {
        avatarContent = <div style={{ backgroundImage: `url(${URL.createObjectURL(image)})` }} className="absolute top-2 left-2 right-2 bottom-2 bg-cover bg-center rounded-full" />
    }

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

    return (
        <div className="p-8 pb-2">
            <div className="flex flex-col gap-2 items-center justify-center relative aspect-square border border-stone-500 rounded-full bg-stone-200"
                onDrop={e => {
                    e.preventDefault();
                    onFile(e.dataTransfer.files[0]);
                }}
            >
                {avatarContent}
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