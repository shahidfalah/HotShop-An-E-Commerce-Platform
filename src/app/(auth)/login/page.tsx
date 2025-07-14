import { redirect } from "next/navigation"

import LoginWithGoogle from "@/_components/LoginWithGoogle"
import FormOnSubmit from "@/_components/FormOnSubmit"
import AuthError from "@/_components/AuthError"

import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import Image from "next/image"

export default async function LoginPage() {
  const session = await getServerSession(authOptions)
  if (session) return redirect("/")

  return (
    <main className="flex flex-row items-center justify-center bg-[#FAFAFA] text-(--color-font) w-full py-10">

      <div className="flex flex-col items-center justify-between h-[100%] md:h-[70%] w-[88%] md:w-[60%] bg-white rounded-lg gap-8 md:flex-row overflow-hidden shadow-md shadow-(--color-shadow)">
        <div className="flex flex-col items-center justify-start p-8 ">
          <h1 className="text-[28px] font-bold mb-6 text-center">Nice to see you again in <span className="text-(--color-primary)">HotShop</span></h1>
          
          <div className="w-full max-w-md">
            <FormOnSubmit mode="login">
              <input type="text" placeholder="Email" name="email" className="inputEnter mb-4" required />
              <input type="password" placeholder="Password" name="password" className="inputEnter mb-4" required/>
              <AuthError />
              <p className="mb-2 w-full text-center" ><a href="" className="text-(--color-primary) hover:underline">Forgot Password?</a></p>
              <button type="submit" className="button-primary"> Log in </button>
            </FormOnSubmit>
            <p className="my-4 w-full text-center text-(--color-font)">Or</p>
            <LoginWithGoogle/>

            <p className="my-4 w-full text-center text-(--color-font)">Do not have an account? <a href="/signup" className="text-(--color-primary) hover:underline">Sign up</a></p>

          </div>

        </div>
        <Image className="h-full m-0 w-[50%] hidden md:block" src="/authImage.png" alt="image-auth" width={100} height={100}/>
      </div>

    </main>
  )
}