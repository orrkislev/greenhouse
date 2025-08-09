import { userActions, useUser } from "@/utils/store/useUser";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export default function Avatar({ user, userId, className, ...props }) {
    const [userData, setUserData] = useState(user);

    useEffect(() => {
        if (!user && userId) {
            userActions.getUserData(userId).then(setUserData);
        }
    }, [user, userId])

    let avatarContent = null;
    if (userData) {
        if (userData.profilePicture) {
            avatarContent = <div style={{ backgroundImage: `url(${userData.profilePicture})` }} className="w-full h-full bg-cover bg-center rounded-full" />
        } else if (userData.firstName && userData.lastName) {
            avatarContent = <div className="text-sm text-stone-500">{userData.firstName.charAt(0)}.{userData.lastName.charAt(0)}</div>
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
    const [isDragging, setIsDragging] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [image, setImage] = useState(null);
    const fileInputRef = useRef(null);
    if (!user) return null;

    let avatarContent = null;
    if (user.profilePicture) {
        avatarContent = <div style={{ backgroundImage: `url(${user.profilePicture})` }} className="absolute top-0 left-0 w-full h-full bg-cover bg-center rounded-full" />
    } else if (user.firstName && user.lastName) {
        avatarContent = <div className="text-2xl text-stone-500">{user.firstName.charAt(0)}.{user.lastName.charAt(0)}</div>
    }

    if (image) {
        avatarContent = <div style={{ backgroundImage: `url(${URL.createObjectURL(image)})` }} className="absolute top-0 left-0 w-full h-full bg-cover bg-center rounded-full" />
    }

    const onFile = (file) => {
        if (file && (file.type === 'image/png' || file.type === 'image/jpg' || file.type === 'image/jpeg')) {
            setImage(file);
        }
    };

    const closeModal = () => {
        if (image) {
            userActions.updateProfilePicture(image);
        }
        setIsEditing(false);
    }

    return (
        <>
            <Avatar user={user} className="cursor-pointer" onClick={() => setIsEditing(true)} />
            <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/jpg"
                className="absolute opacity-0 w-0 h-0"
                tabIndex={-1}
                style={{ position: 'absolute', left: '-9999px' }}
                onChange={e => {
                    const file = e.target.files[0];
                    if (file) onFile(file);
                }}
            />
            {isEditing && (
                <div
                    className="absolute top-0 left-0 w-full h-full bg-black/50 flex items-center justify-center z-1000"
                    onClick={closeModal}
                    onDragEnter={e => {
                        e.preventDefault();
                        setIsDragging(true);
                    }}
                    onDragOver={e => {
                        e.preventDefault();
                        setIsDragging(true);
                    }}
                    onDrop={e => {
                        e.preventDefault();
                        onFile(e.dataTransfer.files[0]);
                        setIsDragging(false);
                    }}
                >
                    <div
                        className="bg-white flex items-center relative justify-center overflow-hidden rounded-full p-4 w-96 h-96 shadow-lg"
                        style={{ scale: isDragging ? 1.1 : 1, transition: 'scale 0.2s ease-in-out' }}
                        onClick={e => e.stopPropagation()} // Prevent closing modal when clicking inside
                    >
                        <div className="flex flex-col gap-2 items-center">
                            {avatarContent}
                            <div className="absolute top-0 left-0 w-full h-full bg-white/70 flex items-center justify-center cursor-pointer"
                                onClick={e => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    fileInputRef.current.click();
                                }}
                            >
                                <div className="flex flex-col gap-2 items-center">
                                    <div className="text-sm text-stone-500">אפשר לגרור תמונה לכאן</div>
                                    <div className='h-px w-16 bg-stone-300' />
                                    <div className="text-sm text-stone-500">או ללחוץ כאן</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
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