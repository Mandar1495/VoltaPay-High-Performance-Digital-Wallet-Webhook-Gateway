import { Button } from "./button";

interface AppbarProps {
    user?: {
        name?: string | null;
    },
    // TODO: can u figure out what the type should be here?
    onSignin: any,
    onSignout: any
}

export const Appbar = ({
    user,
    onSignin,
    onSignout
}: AppbarProps) => {
    return <div className="flex justify-between border-b px-6 py-4 border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="text-xl flex flex-col justify-center font-black tracking-tight text-slate-900 bg-gradient-to-r from-violet-600 to-indigo-650 bg-clip-text text-transparent">
            VoltPay
        </div>
        <div className="flex flex-col justify-center">
            {user ? (
                <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-500">Hi, {user.name || "User"}</span>
                    <button 
                        onClick={onSignout}
                        className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                    >
                        Logout
                    </button>
                </div>
            ) : (
                <button 
                    onClick={onSignin}
                    className="px-5 py-2 text-xs font-bold text-white bg-violet-600 hover:bg-violet-500 rounded-xl transition-colors shadow-md shadow-violet-600/10"
                >
                  Login
                </button>
            )}
        </div>
    </div>
}