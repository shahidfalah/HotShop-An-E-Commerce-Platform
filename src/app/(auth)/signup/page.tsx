import { redirect } from "next/navigation"

import LoginWithGoogle from "@/_components/LoginWithGoogle"
import FormOnSubmit from "@/_components/FormOnSubmit"
import AuthError from "@/_components/AuthError"

import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import Image from "next/image"

export default async function SignupPage() {
  const session = await getServerSession(authOptions)
  if (session) return redirect("/")

  return (
    <main className="flex flex-row items-center justify-center bg-[#FAFAFA] text-(--color-font) w-full py-10">
        <div className="flex flex-col items-center justify-between h-[100%] md:h-[70%] w-[88%] md:w-[60%] bg-white rounded-lg shadow-lg gap-8 md:flex-row overflow-hidden shadow-md shadow-(--color-shadow)">
            <Image className="h-full m-0 w-[53%] hidden md:block transform -scale-x-100" src="/authImage1.png" alt="image-auth" width={100} height={100}/>
            <div className="flex flex-col items-center justify-start p-8 ">
            <h1 className="text-[28px] font-bold mb-6">Welcome to <span className="text-(--color-primary)">HotShop</span></h1>
            
            <div className="w-full max-w-md">
                <FormOnSubmit mode="signup">
                <input type="text" placeholder="name" name="name" className="inputEnter mb-4" required/>
                <input type="text" placeholder="Email" name="email" className="inputEnter mb-4" required/>
                <input type="password" placeholder="Password" name="password" className="inputEnter mb-4" required/>
                <AuthError />
                <p className="mb-2 w-full text-center" ><a href="" className="text-(--color-primary) hover:underline">Forgot Password?</a></p>
                <button type="submit" className="button-primary"> Sign up </button>
                </FormOnSubmit>
                <p className="my-4 w-full text-center text-(--color-font)">Or</p>
                <LoginWithGoogle/>

                <p className="my-4 w-full text-center text-(--color-font)">Have an account already? <a href="/login" className="text-(--color-primary) hover:underline">Login</a></p>

            </div>

            </div>
        </div>
    </main>
  )
}








// // import { GET } from "@/app/api/user/route"
// // import { authOptions } from "@/lib/auth"
// import { redirect } from "next/navigation"
// // import { getServerSession } from "next-auth/next"
// import LoginWithGoogle from "@/_components/LoginWithGoogle"
// import FormOnSubmit from "@/_components/FormOnSubmit"
// import { getServerSession } from "next-auth/next"
// import { authOptions } from "@/lib/auth"
// import Image from "next/image"

// async function SignupPage() {
//     const session = await getServerSession(authOptions)
//     if (session) return redirect("/")

//     return (
//         <main className="flex flex-row items-center justify-center h-[%88] bg-[#FAFAFA] text-(--color-font) w-full m-0">
//             <div className="flex flex-col items-center justify-start w-1/2 h-screen p-8 pt-24">
                
//                 <h1 className="text-[28px] font-bold mb-6">Welcome to <span className="text-(--color-primary)">HotShop</span></h1>
                
//                 <div  className="w-full max-w-md">
                
//                 <FormOnSubmit>
//                     <input type="text" placeholder="Email" className="inputEnter mb-4" required/>
//                     <input type="password" placeholder="Password" className="inputEnter mb-4" required/>
//                     <button type="submit" className="button-primary"> Log in </button>
//                 </FormOnSubmit>

//                 <LoginWithGoogle/>
//                 </div>

//             </div>
//             <Image className="h-screen" src="/authImage1.png" alt="image-auth" />
//         </main>
//     )
// }

// export default SignupPage;