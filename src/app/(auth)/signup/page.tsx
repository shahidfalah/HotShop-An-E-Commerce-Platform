
// import { GET } from "@/app/api/user/route"
// import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
// import { getServerSession } from "next-auth/next"
import LoginWithGoogle from "@/_components/LoginWithGoogle"
import FormOnSubmit from "@/_components/FormOnSubmit"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

async function SignupPage() {
    const session = await getServerSession(authOptions)
    if (session) return redirect("/")

    return (
        <main className="flex flex-row items-center justify-center h-[%88] bg-[#FAFAFA] text-(--color-font) w-full m-0">
            <div className="flex flex-col items-center justify-start w-1/2 h-screen p-8 pt-24">
                
                <h1 className="text-[28px] font-bold mb-6">Welcome to <span className="text-(--color-primary)">HotShop</span></h1>
                
                <div  className="w-full max-w-md">
                
                <FormOnSubmit>
                    <input type="text" placeholder="Email" className="inputEnter mb-4" required/>
                    <input type="password" placeholder="Password" className="inputEnter mb-4" required/>
                    <button type="submit" className="button-primary"> Log in </button>
                </FormOnSubmit>

                <LoginWithGoogle/>
                </div>

            </div>
            <img className="h-screen" src="/authImage1.png" alt="image-auth" />
        </main>
    )
}

export default SignupPage;