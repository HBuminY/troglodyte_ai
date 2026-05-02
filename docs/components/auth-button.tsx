import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";

export async function AuthButton() {
  const supabase = await createClient();

  // getUser() is the more reliable source for server-side auth checks
  const { data: { user } } = await supabase.auth.getUser();

  return user ? (
    <div className="flex items-center gap-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            {user.email}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-content" align="start">
          <Button asChild variant="ghost" size="sm" className="w-full justify-start">
            <Link href="/profile/dashboard">Dashboard</Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="w-full justify-start">
            <Link href="/profile/settings">Settings</Link>
          </Button>
        </DropdownMenuContent>
      </DropdownMenu>
      {/* <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Link href="/profile"></Link>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-content" align="start">
            {"hello!"}
          </DropdownMenuContent>
        </DropdownMenu> */}
      <LogoutButton />
    </div>
  ) : (
    <div className="flex gap-2">
      <Button asChild size="sm" variant={"outline"}>
        <Link href="/auth/login">Sign in</Link>
      </Button>
      <Button asChild size="sm" variant={"default"}>
        <Link href="/auth/sign-up">Sign up</Link>
      </Button>
    </div>
  );
}
