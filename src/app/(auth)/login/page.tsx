import { redirect } from "next/navigation"

import LoginWithGoogle from "@/_components/LoginWithGoogle"
import FormOnSubmit from "@/_components/FormOnSubmit"

import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export default async function LoginPage() {
  const session = await getServerSession(authOptions)
  if (session) return redirect("/")

  return (
    <main className="flex flex-row items-center justify-center bg-[#FAFAFA] text-(--color-font) w-full py-10">

      <div className="flex flex-col items-center justify-between h-[100%] md:h-[70%] w-[88%] md:w-[60%] bg-white rounded-lg shadow-lg gap-8 md:flex-row overflow-hidden shadow-md shadow-(--color-shadow)">
        <div className="flex flex-col items-center justify-start p-8 ">
          <h1 className="text-[28px] font-bold mb-6">Welcome to <span className="text-(--color-primary)">HotShop</span></h1>
          
          <div className="w-full max-w-md">
            <FormOnSubmit>
              <input type="text" placeholder="Email" className="inputEnter mb-4" required/>
              <input type="password" placeholder="Password" className="inputEnter mb-4" required/>
              <button type="submit" className="button-primary"> Log in </button>
            </FormOnSubmit>

            <LoginWithGoogle/>

          </div>

        </div>
        <img className="h-full m-0 w-[50%] hidden md:block" src="/authImage1.png" alt="image-auth" />
      </div>

    </main>
  )
}